import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TocItem } from '../../models/post.model';

const ACTIVE_LINK_PADDING_PX = 8;

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  templateUrl: './table-of-contents.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './table-of-contents.css',
})
export class TableOfContentsComponent {
  private readonly scrollViewport = viewChild<ElementRef<HTMLElement>>('scrollViewport');

  readonly items = input.required<readonly TocItem[]>();
  readonly postPath = input.required<string>();
  readonly activeHeadingId = input('');
  readonly progress = input(0);
  readonly tocId = input('post-toc');
  readonly label = input('Table of contents');
  readonly title = input('Contents');
  readonly shell = input<'blog' | 'site'>('blog');
  readonly headingSelected = output<string>();

  readonly titleId = computed(() => `${this.tocId()}-title`);
  readonly progressPercent = computed(() =>
    Math.round(Math.min(1, Math.max(0, this.progress())) * 100),
  );
  readonly normalizedProgress = computed(() => Math.min(1, Math.max(0, this.progress())));

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
  }

  hrefFor(id: string): string {
    return `${this.postPath()}#${encodeURIComponent(id)}`;
  }

  containsActiveItem(item: TocItem): boolean {
    const activeId = this.activeHeadingId();
    return item.id === activeId || item.children.some((child) => child.id === activeId);
  }

  selectHeading(event: MouseEvent, id: string): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    this.headingSelected.emit(id);
  }

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
      this.scrollToc(viewport, viewport.scrollTop - (visibleTop - linkRect.top));
    } else if (linkRect.bottom > visibleBottom) {
      this.scrollToc(viewport, viewport.scrollTop + (linkRect.bottom - visibleBottom));
    }
  }

  private scrollToc(viewport: HTMLElement, top: number): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
