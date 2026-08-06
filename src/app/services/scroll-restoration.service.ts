import { Injectable, OnDestroy } from '@angular/core';

const STORAGE_KEY_PREFIX = 'lmms-lab-blog:scroll-position:';
const MIN_RESTORE_FRAMES = 2;
const MAX_RESTORE_FRAMES = 120;

interface StoredScrollPosition {
  url: string;
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class ScrollRestorationService implements OnDestroy {
  private initialized = false;
  private pendingPosition: StoredScrollPosition | null = null;
  private restoreAttempts = 0;
  private restoreFrame: number | null = null;
  private restoreTimer: number | null = null;

  initialize(): void {
    if (this.initialized || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.initialized = true;
    window.addEventListener('pagehide', this.savePosition);
    this.pendingPosition = this.readPositionForHistoryNavigation();

    if (this.pendingPosition) {
      this.restoreTimer = window.setTimeout(() => {
        this.restoreTimer = null;
        this.queueRestoreFrame();
      });
    }
  }

  ngOnDestroy(): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('pagehide', this.savePosition);

    if (this.restoreTimer !== null) {
      window.clearTimeout(this.restoreTimer);
      this.restoreTimer = null;
    }

    if (this.restoreFrame !== null) {
      window.cancelAnimationFrame(this.restoreFrame);
      this.restoreFrame = null;
    }
  }

  private readonly savePosition = (): void => {
    const url = this.currentUrl();
    const position: StoredScrollPosition = {
      url,
      x: window.scrollX,
      y: window.scrollY,
    };

    try {
      window.sessionStorage.setItem(this.storageKey(url), JSON.stringify(position));
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }
  };

  private readPositionForHistoryNavigation(): StoredScrollPosition | null {
    if (!this.isHistoryNavigation()) {
      return null;
    }

    try {
      const url = this.currentUrl();
      const storageKey = this.storageKey(url);
      const storedValue = window.sessionStorage.getItem(storageKey);
      window.sessionStorage.removeItem(storageKey);

      if (!storedValue) {
        return null;
      }

      const position: unknown = JSON.parse(storedValue);
      if (!this.isStoredPosition(position) || position.url !== url) {
        return null;
      }

      return position;
    } catch {
      return null;
    }
  }

  private isHistoryNavigation(): boolean {
    const navigationEntry = window.performance.getEntriesByType?.(
      'navigation',
    )[0] as PerformanceNavigationTiming | undefined;

    if (navigationEntry) {
      return navigationEntry.type === 'reload' || navigationEntry.type === 'back_forward';
    }

    const legacyNavigation = (
      window.performance as Performance & { navigation?: { type?: number } }
    ).navigation;
    return legacyNavigation?.type === 1 || legacyNavigation?.type === 2;
  }

  private isStoredPosition(value: unknown): value is StoredScrollPosition {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const position = value as Partial<StoredScrollPosition>;
    return (
      typeof position.url === 'string' &&
      typeof position.x === 'number' &&
      Number.isFinite(position.x) &&
      position.x >= 0 &&
      typeof position.y === 'number' &&
      Number.isFinite(position.y) &&
      position.y >= 0
    );
  }

  private queueRestoreFrame(): void {
    this.restoreFrame = window.requestAnimationFrame(() => {
      this.restoreFrame = null;
      this.restorePosition();
    });
  }

  private restorePosition(): void {
    const position = this.pendingPosition;
    if (!position || position.url !== this.currentUrl()) {
      this.pendingPosition = null;
      return;
    }

    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    const maximumY = Math.max(0, scrollHeight - window.innerHeight);
    window.scrollTo(position.x, Math.min(position.y, maximumY));

    this.restoreAttempts += 1;
    const contentCanReachPosition = maximumY >= position.y;
    if (
      this.restoreAttempts < MIN_RESTORE_FRAMES ||
      (!contentCanReachPosition && this.restoreAttempts < MAX_RESTORE_FRAMES)
    ) {
      this.queueRestoreFrame();
      return;
    }

    this.pendingPosition = null;
  }

  private currentUrl(): string {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    return `${pathname}${window.location.search}${window.location.hash}`;
  }

  private storageKey(url: string): string {
    return `${STORAGE_KEY_PREFIX}${url}`;
  }
}
