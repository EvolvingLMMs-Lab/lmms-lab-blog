import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from '../site-footer/site-footer';
import { SiteHeaderComponent } from '../site-header/site-header';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './site-shell.html',
  styleUrl: './site-shell.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SiteShellComponent {
  constructor() {
    const document = inject(DOCUMENT);
    document.documentElement.classList.add('lab-site-active');
    inject(DestroyRef).onDestroy(() =>
      document.documentElement.classList.remove('lab-site-active'),
    );
  }
}
