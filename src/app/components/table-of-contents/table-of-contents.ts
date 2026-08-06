import { DOCUMENT } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TocItem } from '../../utils/toc-builder';

const WIDE_QUERY = '(min-width: 1440px)';
const ACTIVE_LINK_PADDING_PX = 8;

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CdkTrapFocus],
  templateUrl: './table-of-contents.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './table-of-contents.css',
})
export class TableOfContentsComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly scrollViewport = viewChild<ElementRef<HTMLElement>>('scrollViewport');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private viewportMediaQuery: MediaQueryList | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;
  private previousBodyOverflow = '';
  private previousBodyOverscrollBehavior = '';
  private bodyScrollLocked = false;
  private drawerWasOpen = false;
  private focusFrame: number | null = null;

  readonly items = input.required<readonly TocItem[]>();
  readonly activeHeadingId = input('');
  readonly tocId = input('post-toc');
  readonly label = input('Table of contents');
  readonly title = input('Contents');
  readonly open = model(false);
  readonly headingSelected = output<string>();

  readonly isWide = signal(false);
  readonly drawerOpen = computed(() => this.open() && !this.isWide());
  readonly titleId = computed(() => `${this.tocId()}-title`);

  constructor() {
    effect((onCleanup) => {
      const activeId = this.activeHeadingId();
      const viewport = this.scrollViewport()?.nativeElement;

      if (!activeId || !viewport || typeof window === 'undefined') {
        return;
      }

      const frame = window.requestAnimationFrame(() => this.revealActiveLink(viewport, activeId));
      onCleanup(() => window.cancelAnimationFrame(frame));
    });

    effect(() => {
      const drawerOpen = this.drawerOpen();

      if (drawerOpen && !this.drawerWasOpen) {
        this.openDrawer();
      } else if (!drawerOpen && this.drawerWasOpen) {
        this.closeDrawer();
      }

      this.drawerWasOpen = drawerOpen;
    });
  }

  ngOnInit(): void {
    this.setupViewportObserver();
  }

  ngOnDestroy(): void {
    this.teardownViewportObserver();
    if (this.focusFrame !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.focusFrame);
      this.focusFrame = null;
    }
    this.unlockBodyScroll();
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  selectHeading(event: Event, id: string): void {
    event.preventDefault();
    this.headingSelected.emit(id);

    if (!this.isWide()) {
      this.close();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) {
      return;
    }

    event.preventDefault();
    this.close();
  }

  private setupViewportObserver(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(WIDE_QUERY);
    this.viewportMediaQuery = mediaQuery;
    this.isWide.set(mediaQuery.matches);
    this.open.set(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', this.handleViewportChange);
      return;
    }

    mediaQuery.addListener(this.handleViewportChange);
  }

  private teardownViewportObserver(): void {
    const mediaQuery = this.viewportMediaQuery;
    if (!mediaQuery) {
      return;
    }

    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', this.handleViewportChange);
    } else {
      mediaQuery.removeListener(this.handleViewportChange);
    }

    this.viewportMediaQuery = null;
  }

  private readonly handleViewportChange = (event: MediaQueryListEvent): void => {
    this.isWide.set(event.matches);
    this.open.set(event.matches);
  };

  private revealActiveLink(viewport: HTMLElement, activeId: string): void {
    const activeLink = Array.from(viewport.querySelectorAll<HTMLAnchorElement>('.toc-link')).find(
      (link) => link.getAttribute('data-toc-id') === activeId,
    );

    if (!activeLink) {
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const visibleTop = viewportRect.top + ACTIVE_LINK_PADDING_PX;
    const visibleBottom = viewportRect.bottom - ACTIVE_LINK_PADDING_PX;

    if (linkRect.top < visibleTop) {
      viewport.scrollTop -= visibleTop - linkRect.top;
    } else if (linkRect.bottom > visibleBottom) {
      viewport.scrollTop += linkRect.bottom - visibleBottom;
    }
  }

  private openDrawer(): void {
    const activeElement = this.document.activeElement;
    this.previouslyFocusedElement = activeElement instanceof HTMLElement ? activeElement : null;
    this.lockBodyScroll();

    if (typeof window !== 'undefined') {
      this.focusFrame = window.requestAnimationFrame(() => {
        this.focusFrame = null;
        this.closeButton()?.nativeElement.focus({ preventScroll: true });
      });
    }
  }

  private closeDrawer(): void {
    if (this.focusFrame !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.focusFrame);
      this.focusFrame = null;
    }
    this.unlockBodyScroll();
    this.previouslyFocusedElement?.focus({ preventScroll: true });
    this.previouslyFocusedElement = null;
  }

  private lockBodyScroll(): void {
    if (this.bodyScrollLocked) {
      return;
    }

    const body = this.document.body;
    this.previousBodyOverflow = body.style.overflow;
    this.previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'contain';
    this.bodyScrollLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!this.bodyScrollLocked) {
      return;
    }

    const body = this.document.body;
    body.style.overflow = this.previousBodyOverflow;
    body.style.overscrollBehavior = this.previousBodyOverscrollBehavior;
    this.bodyScrollLocked = false;
  }
}
