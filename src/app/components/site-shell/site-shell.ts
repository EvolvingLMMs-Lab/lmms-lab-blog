import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class SiteShellComponent {}
