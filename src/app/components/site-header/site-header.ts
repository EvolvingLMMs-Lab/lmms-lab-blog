import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

interface LmmsRenderer {
  pal(theme: string): unknown;
  scene(
    mode: string,
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    palette: unknown,
    now: number,
    options?: Record<string, unknown>,
  ): void;
}

interface LmmsWindow extends Window {
  LMMSRender?: { make(): LmmsRenderer };
}

const LOGO_STAGE_WIDTH = 2400;
const LOGO_STAGE_HEIGHT = 390;
const LOGO_DURATION_MS = 8000;
const LOGO_SCENE_OPTIONS = { bare: true, alignX: 'left', padX: 8, eCell: 24 };
let rendererLoad: Promise<void> | null = null;

function loadRenderer(document: Document): Promise<void> {
  const browserWindow = document.defaultView as LmmsWindow | null;
  if (!browserWindow || browserWindow.LMMSRender) {
    return Promise.resolve();
  }

  if (!rendererLoad) {
    const injectScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        });
        document.head.appendChild(script);
      });

    rendererLoad = injectScript('/animation/lmms-pixelfont.js').then(() =>
      injectScript('/animation/lmms-render.js'),
    );
  }

  return rendererLoad;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly logoCanvas = viewChild<ElementRef<HTMLCanvasElement>>('logoCanvas');
  private readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly gallery = viewChild<ElementRef<HTMLElement>>('gallery');
  private readonly galleryTrigger = viewChild<ElementRef<HTMLButtonElement>>('galleryTrigger');

  readonly menuOpen = signal(false);
  readonly galleryOpen = signal(false);
  readonly logoReady = signal(false);

  private galleryCloseTimer: number | null = null;
  private logoAnimationFrame = 0;
  private logoObserver: ResizeObserver | null = null;
  private disposed = false;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMenu());

    afterNextRender(() => this.startLogoAnimation());

    this.destroyRef.onDestroy(() => {
      this.disposed = true;
      this.clearGalleryCloseTimer();
      this.logoObserver?.disconnect();
      const browserWindow = this.document.defaultView;
      if (browserWindow && typeof browserWindow.cancelAnimationFrame === 'function') {
        browserWindow.cancelAnimationFrame(this.logoAnimationFrame);
      }
      this.document.body.classList.remove('site-menu-open');
    });
  }

  toggleMenu(): void {
    const open = !this.menuOpen();
    this.menuOpen.set(open);
    this.document.body.classList.toggle('site-menu-open', open);

    if (open) {
      this.document.defaultView?.setTimeout(() => {
        this.mobileMenu()?.nativeElement.querySelector<HTMLElement>('a[href]')?.focus();
      });
    }
  }

  closeMenu(restoreFocus = false): void {
    const wasOpen = this.menuOpen();
    this.menuOpen.set(false);
    this.closeGallery();
    this.document.body.classList.remove('site-menu-open');
    if (restoreFocus && wasOpen) {
      this.menuButton()?.nativeElement.focus();
    }
  }

  openGallery(): void {
    this.clearGalleryCloseTimer();
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.clearGalleryCloseTimer();
    this.galleryOpen.set(false);
  }

  scheduleGalleryClose(): void {
    this.clearGalleryCloseTimer();
    this.galleryCloseTimer =
      this.document.defaultView?.setTimeout(() => {
        this.galleryOpen.set(false);
        this.galleryCloseTimer = null;
      }, 180) ?? null;
  }

  onGalleryFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget as Node | null;
    if (
      !nextFocused ||
      !event.currentTarget ||
      !(event.currentTarget as Node).contains(nextFocused)
    ) {
      this.closeGallery();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (this.galleryOpen() && !this.gallery()?.nativeElement.contains(event.target as Node)) {
      this.closeGallery();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.menuOpen()) {
        event.preventDefault();
        this.closeMenu(true);
      } else if (this.galleryOpen()) {
        event.preventDefault();
        this.closeGallery();
        this.galleryTrigger()?.nativeElement.focus();
      }
      return;
    }

    if (event.key !== 'Tab' || !this.menuOpen()) {
      return;
    }

    const focusable = Array.from(
      this.mobileMenu()?.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ) ?? [],
    );
    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  private clearGalleryCloseTimer(): void {
    if (this.galleryCloseTimer !== null) {
      this.document.defaultView?.clearTimeout(this.galleryCloseTimer);
      this.galleryCloseTimer = null;
    }
  }

  private startLogoAnimation(): void {
    const browserWindow = this.document.defaultView as LmmsWindow | null;
    const canvas = this.logoCanvas()?.nativeElement;
    if (
      !browserWindow ||
      !canvas ||
      browserWindow.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    void loadRenderer(this.document)
      .then(() => {
        if (this.disposed || !browserWindow.LMMSRender) {
          return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
          return;
        }

        const renderer = browserWindow.LMMSRender.make();
        const palette = renderer.pal('light');
        const fit = () => {
          const bounds = canvas.getBoundingClientRect();
          const dpr = browserWindow.devicePixelRatio || 1;
          const width = Math.max(1, Math.round(bounds.width * dpr));
          const height = Math.max(1, Math.round(bounds.height * dpr));
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
        };

        fit();
        this.logoObserver = new ResizeObserver(fit);
        this.logoObserver.observe(canvas);
        const start = browserWindow.performance.now();
        let firstFrame = true;

        const renderFrame = (now: number) => {
          if (this.disposed) {
            return;
          }
          const scale = canvas.height / LOGO_STAGE_HEIGHT;
          context.setTransform(scale, 0, 0, scale, 0, 0);
          renderer.scene(
            'b',
            context,
            LOGO_STAGE_WIDTH,
            LOGO_STAGE_HEIGHT,
            ((now - start) % LOGO_DURATION_MS) / LOGO_DURATION_MS,
            palette,
            now,
            LOGO_SCENE_OPTIONS,
          );
          if (firstFrame) {
            firstFrame = false;
            this.logoReady.set(true);
          }
          this.logoAnimationFrame = browserWindow.requestAnimationFrame(renderFrame);
        };

        this.logoAnimationFrame = browserWindow.requestAnimationFrame(renderFrame);
      })
      .catch(() => {
        // Keep the static logo visible when the renderer cannot load.
      });
  }
}
