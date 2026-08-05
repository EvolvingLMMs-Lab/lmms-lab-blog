import { ViewportScroller } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollRestorationService } from './services/scroll-restoration.service';

const HEADING_SCROLL_OFFSET_PX = 20;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(ViewportScroller).setOffset([0, HEADING_SCROLL_OFFSET_PX]);
    const scrollRestoration = inject(ScrollRestorationService);

    afterNextRender(() => scrollRestoration.initialize());
  }
}
