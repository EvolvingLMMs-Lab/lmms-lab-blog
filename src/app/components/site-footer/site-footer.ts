import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SiteFooterComponent {
  readonly currentYear = new Date().getFullYear();
}
