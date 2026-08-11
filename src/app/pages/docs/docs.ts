import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top';
import { AUTHORING_DOCS_HTML, AUTHORING_DOCS_TOC } from '../../data/authoring-docs';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { HeadingObserver } from '../../utils/heading-observer';
import { initCodeCopyButtons } from '../../utils/post-content-hooks';
import { jumpScrollTo, SmoothScrollHandle, smoothScrollTo } from '../../utils/smooth-scroll';
import { TableOfContentsComponent } from '../../components/table-of-contents/table-of-contents';
import { replaceLocationHash } from '../../utils/location-hash';
import { SeoService } from '../../services/seo.service';

const HEADING_SCROLL_OFFSET_PX = 20;

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [RouterLink, BackToTopComponent, TableOfContentsComponent],
  templateUrl: './docs.html',
  styleUrls: [
    '../post/styles/typography.css',
    '../post/styles/code-blocks.css',
    '../post/styles/tables.css',
    '../post/styles/layout.css',
    './docs.css',
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class DocsComponent implements AfterViewInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toolbarExt = inject(ToolbarExtensionService);
  private readonly headingObserver = new HeadingObserver();
  private readonly docsBody = viewChild<ElementRef<HTMLElement>>('docsBody');
  private scrollHandle: SmoothScrollHandle | null = null;
  private setupTimer: number | null = null;

  readonly activeHeadingId = this.headingObserver.activeHeadingId;
  readonly readingProgress = this.headingObserver.readingProgress;
  readonly tocItems = AUTHORING_DOCS_TOC;
  readonly safeHtml = this.sanitizer.bypassSecurityTrustHtml(AUTHORING_DOCS_HTML);

  constructor() {
    inject(SeoService).setPage({
      title: 'Blog authoring guide',
      description: 'The publishing and authoring reference for the LMMs-Lab blog.',
      path: '/blog/docs',
    });
    this.toolbarExt.mobileTitle.set('Docs');
    this.toolbarExt.leadingButtons.set([]);
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.setupTimer = window.setTimeout(() => {
      this.setupTimer = null;
      initCodeCopyButtons();
      const docsBody = this.docsBody()?.nativeElement;
      if (docsBody) {
        this.setupHeadingObserver(docsBody);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.setupTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.setupTimer);
    }
    this.headingObserver.disconnect();
    this.scrollHandle?.cancel();
    this.toolbarExt.reset();
  }

  onTocHeadingSelected(id: string): void {
    this.scrollToHeading(id, true, true);
  }

  private setupHeadingObserver(docsBody: HTMLElement): void {
    const hashId = this.readHashId();
    this.headingObserver.observe(docsBody, this.tocItems, hashId);

    if (hashId) {
      this.scrollToHeading(hashId, false);
    }
  }

  private scrollToHeading(id: string, smooth: boolean, focus = false): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const heading = Array.from(
      this.docsBody()?.nativeElement.querySelectorAll<HTMLElement>('h2[id], h3[id]') ?? [],
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

    this.scrollHandle?.cancel();
    if (smooth) {
      this.scrollHandle = smoothScrollTo(targetY);
    } else {
      jumpScrollTo(targetY);
    }

    this.activeHeadingId.set(id);
    replaceLocationHash(id);

    if (focus) {
      window.requestAnimationFrame(() => heading.focus({ preventScroll: true }));
    }
  }

  private readHashId(): string | null {
    if (typeof window === 'undefined' || !window.location.hash) {
      return null;
    }

    try {
      return decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return null;
    }
  }
}
