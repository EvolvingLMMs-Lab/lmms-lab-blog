import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SiteHeaderComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly menuOpen = signal(false);
  readonly galleryOpen = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMenu());
    this.destroyRef.onDestroy(() => this.document.body.classList.remove('site-menu-open'));
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.document.body.classList.toggle('site-menu-open', this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.galleryOpen.set(false);
    this.document.body.classList.remove('site-menu-open');
  }

  toggleGallery(): void {
    this.galleryOpen.update((open) => !open);
  }
}
