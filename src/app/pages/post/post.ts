import {
  ApplicationRef,
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  OnDestroy,
  ViewEncapsulation,
  computed,
  createComponent,
  effect,
  inject,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { POSTS } from '../../data/posts';
import { PostHeaderComponent } from '../../components/post-header/post-header';
import { GiscusCommentsComponent } from '../../components/giscus-comments/giscus-comments';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { ImageLightboxComponent } from '../../components/image-lightbox/image-lightbox';
import {
  initAiSummaryFigures,
  initCodeCopyButtons,
  initContentImageZoom,
  initContentVideos,
  initHtmlControllers,
  optimizeContentImages,
} from '../../utils/post-content-hooks';
import { typesetMath } from '../../utils/mathjax';
import { jumpScrollTo, smoothScrollTo, SmoothScrollHandle } from '../../utils/smooth-scroll';
import { HeadingObserver } from '../../utils/heading-observer';
import { TableOfContentsComponent } from '../../components/table-of-contents/table-of-contents';
import { replaceLocationHash } from '../../utils/location-hash';
import { SeoService } from '../../services/seo.service';
import { legacyArticlePath, normalizeLegacySlug } from '../../config/legacy-routes';

const HEADING_SCROLL_OFFSET_PX = 20;

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    RouterLink,
    PostHeaderComponent,
    GiscusCommentsComponent,
    BackToTopComponent,
    TableOfContentsComponent,
  ],
  templateUrl: './post.html',
  styleUrls: [
    './styles/typography.css',
    './styles/code-blocks.css',
    './styles/tables.css',
    './styles/media.css',
    './styles/research-blocks.css',
    './styles/native-html.css',
    './styles/layout.css',
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class PostComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toolbarExt = inject(ToolbarExtensionService);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly seo = inject(SeoService);
  private readonly rawSlug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))));
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });
  private readonly slug = computed(() => {
    const configuredSlug = this.routeData()['articleSlug'];
    if (typeof configuredSlug === 'string') {
      return configuredSlug;
    }

    const routeSlug = this.rawSlug();
    return routeSlug ? normalizeLegacySlug(routeSlug) : null;
  });
  private readonly headingObserver = new HeadingObserver();
  private scrollHandle: SmoothScrollHandle | null = null;

  private readonly giscus = viewChild(GiscusCommentsComponent);
  private readonly postBody = viewChild<ElementRef<HTMLElement>>('postBody');

  readonly activeHeadingId = this.headingObserver.activeHeadingId;
  readonly readingProgress = this.headingObserver.readingProgress;

  readonly post = computed(() => {
    const s = this.slug();
    return POSTS.find((p) => p.slug === s);
  });

  readonly tocItems = computed(() => this.post()?.toc ?? []);
  readonly postPath = computed(() => {
    const post = this.post();
    if (!post) {
      return this.backPath();
    }

    const canonicalPath = this.routeData()['canonicalPath'];
    if (typeof canonicalPath === 'string' && canonicalPath.startsWith('/')) {
      return canonicalPath;
    }

    const legacyKind = this.legacyKind();
    return legacyKind
      ? legacyArticlePath(post.slug, legacyKind)
      : `/blog/${encodeURIComponent(post.slug)}`;
  });

  readonly legacyKind = computed(() => {
    const kind = this.routeData()['legacyKind'];
    return kind === 'posts' || kind === 'notes' ? kind : null;
  });

  readonly backPath = computed(() => {
    const kind = this.legacyKind();
    return kind ? `/${kind}` : '/blog';
  });

  readonly safeHtml = computed(() => {
    const post = this.post();
    if (!post) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const blogPath = `/blog/${encodeURIComponent(post.slug)}`;
    const currentPath = this.postPath();
    const html =
      currentPath === blogPath
        ? post.contentHtml
        : post.contentHtml.replaceAll(`href="${blogPath}#`, `href="${currentPath}#`);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor() {
    this.setupToolbarExtension();

    effect(() => {
      const post = this.post();
      if (post) {
        this.seo.setPage({
          title: post.title,
          description: post.description,
          path: this.postPath(),
          type: 'article',
        });
      }
    });

    effect((onCleanup) => {
      this.safeHtml();

      if (typeof window === 'undefined') {
        return;
      }

      let cleanupAiSummaryFigures: (() => void) | null = null;
      let cleanupContentImageZoom: (() => void) | null = null;
      let cleanupContentImages: (() => void) | null = null;
      let cleanupContentVideos: (() => void) | null = null;
      let cleanupHtmlControllers: (() => void) | null = null;
      let cleanupMath: (() => void) | null = null;
      let setupTimer: number | null = null;
      let isDisposed = false;
      const mathAbortController = new AbortController();

      const runPostHooks = (attempt = 0) => {
        setupTimer = window.setTimeout(
          () => {
            setupTimer = null;
            if (isDisposed) {
              return;
            }

            const postBody = this.postBody()?.nativeElement;
            if (!postBody || postBody.childElementCount === 0) {
              if (attempt < 20) {
                runPostHooks(attempt + 1);
              }
              return;
            }

            void typesetMath(postBody, mathAbortController.signal).then((cleanup) => {
              if (isDisposed) {
                cleanup();
              } else {
                cleanupMath = cleanup;
                this.headingObserver.refresh();
              }
            });
            initCodeCopyButtons();
            optimizeContentImages();
            cleanupContentImages = this.hydrateContentImages(postBody);
            cleanupAiSummaryFigures = initAiSummaryFigures(postBody);
            cleanupContentImageZoom = initContentImageZoom(postBody);
            cleanupContentVideos = initContentVideos(postBody);
            cleanupHtmlControllers = initHtmlControllers(postBody);
            this.setupHeadingObserver(postBody);
            this.giscus()?.load();
          },
          attempt === 0 ? 0 : 25,
        );
      };

      runPostHooks();

      onCleanup(() => {
        isDisposed = true;
        mathAbortController.abort();
        if (setupTimer !== null) {
          window.clearTimeout(setupTimer);
        }
        cleanupAiSummaryFigures?.();
        cleanupContentImageZoom?.();
        cleanupContentImages?.();
        cleanupContentVideos?.();
        cleanupHtmlControllers?.();
        cleanupMath?.();
        this.headingObserver.disconnect();
      });
    });
  }

  ngOnDestroy(): void {
    this.headingObserver.disconnect();
    this.scrollHandle?.cancel();
    this.toolbarExt.reset();
  }

  onTocHeadingSelected(id: string): void {
    this.scrollToHeading(id, true, true);
  }

  private setupToolbarExtension(): void {
    this.toolbarExt.mobileTitle.set('Reading');
    this.toolbarExt.leadingButtons.set([]);
  }

  private setupHeadingObserver(postBody: HTMLElement): void {
    const toc = this.tocItems();
    const hashId = this.readHashId();
    this.headingObserver.observe(postBody, toc, hashId);

    if (hashId) {
      this.scrollToHeading(hashId, false);
    }
  }

  private scrollToHeading(id: string, smooth: boolean, focus = false): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const heading = Array.from(
      this.postBody()?.nativeElement.querySelectorAll<HTMLElement>('h2[id], h3[id]') ?? [],
    ).find((candidate) => candidate.id === id);
    if (!heading) {
      return;
    }

    const scrollMargin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop);
    const scrollOffset = Number.isFinite(scrollMargin) ? scrollMargin : HEADING_SCROLL_OFFSET_PX;
    const targetY = Math.max(
      0,
      window.scrollY + heading.getBoundingClientRect().top - scrollOffset,
    );

    if (smooth) {
      this.scrollHandle?.cancel();
      this.scrollHandle = smoothScrollTo(targetY);
    } else {
      this.scrollHandle?.cancel();
      jumpScrollTo(targetY);
    }

    this.activeHeadingId.set(id);
    replaceLocationHash(id);

    if (focus) {
      window.requestAnimationFrame(() => heading.focus({ preventScroll: true }));
    }
  }

  private readHashId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const { hash } = window.location;
    if (!hash) {
      return null;
    }

    try {
      return decodeURIComponent(hash.slice(1));
    } catch {
      return null;
    }
  }

  private hydrateContentImages(container: HTMLElement): () => void {
    const refs: Array<ComponentRef<ImageLightboxComponent>> = [];

    for (const image of Array.from(container.querySelectorAll<HTMLImageElement>('img'))) {
      const src = image.getAttribute('src');
      const width = image.getAttribute('width');
      const height = image.getAttribute('height');

      if (!src || !width || !height) {
        continue;
      }

      const host = document.createElement('app-image-lightbox');
      const ref = createComponent(ImageLightboxComponent, {
        environmentInjector: this.environmentInjector,
        hostElement: host,
      });

      ref.setInput('src', src);
      ref.setInput('alt', image.getAttribute('alt') ?? '');
      ref.setInput('width', width);
      ref.setInput('height', height);
      ref.setInput('imgClass', image.className);
      ref.setInput('loading', image.getAttribute('loading') === 'eager' ? 'eager' : 'lazy');
      ref.setInput('sizes', image.getAttribute('sizes') ?? undefined);

      image.replaceWith(host);
      this.appRef.attachView(ref.hostView);
      ref.changeDetectorRef.detectChanges();
      refs.push(ref);
    }

    return () => {
      for (const ref of refs) {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
      }
    };
  }
}
