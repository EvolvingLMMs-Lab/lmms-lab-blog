import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewEncapsulation,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top';
import { AUTHORING_DOCS_HTML } from '../../data/authoring-docs';
import { ToolbarExtensionService } from '../../services/toolbar-extension.service';
import { HeadingObserver } from '../../utils/heading-observer';
import { initCodeCopyButtons } from '../../utils/post-content-hooks';
import { SmoothScrollHandle, smoothScrollTo } from '../../utils/smooth-scroll';
import { buildContentWithToc } from '../../utils/toc-builder';
import { TableOfContentsComponent } from '../../components/table-of-contents/table-of-contents';

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
  private readonly processedContent = buildContentWithToc(AUTHORING_DOCS_HTML);
  private scrollHandle: SmoothScrollHandle | null = null;
  private setupTimer: number | null = null;

  readonly tocOpen = signal(false);
  readonly activeHeadingId = this.headingObserver.activeHeadingId;
  readonly tocItems = this.processedContent.toc;
  readonly safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.processedContent.html);

  constructor() {
    this.toolbarExt.mobileTitle.set('Docs');
    this.toolbarExt.leadingButtons.set([
      {
        icon: 'ph-list',
        toggleIcon: 'ph-x',
        ariaLabel: 'Toggle table of contents',
        title: 'Table of Contents',
        action: () => this.toggleToc(),
        isToggled: () => this.tocOpen(),
      },
    ]);
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.setupTimer = window.setTimeout(() => {
      this.setupTimer = null;
      initCodeCopyButtons();
      this.setupHeadingObserver();
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

  toggleToc(): void {
    this.tocOpen.update((value) => !value);
  }

  onTocHeadingSelected(id: string): void {
    this.scrollToHeading(id, true);
  }

  private setupHeadingObserver(): void {
    const hashId = this.readHashId();
    this.headingObserver.observe(this.tocItems, hashId);

    if (hashId) {
      this.scrollToHeading(hashId, false);
    }
  }

  private scrollToHeading(id: string, smooth: boolean): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    const targetY = Math.max(
      0,
      window.scrollY + heading.getBoundingClientRect().top - HEADING_SCROLL_OFFSET_PX,
    );

    this.scrollHandle?.cancel();
    if (smooth) {
      this.scrollHandle = smoothScrollTo(targetY);
    } else {
      window.scrollTo(0, targetY);
    }

    this.activeHeadingId.set(id);
    if (typeof history !== 'undefined') {
      history.replaceState(null, '', `#${encodeURIComponent(id)}`);
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
