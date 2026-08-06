import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollRestorationService } from './scroll-restoration.service';

type NavigationType = PerformanceNavigationTiming['type'];

describe('ScrollRestorationService', () => {
  let navigationType: NavigationType;
  let scrollHeight: number;
  let scrollX: number;
  let scrollY: number;
  let nextFrameId: number;
  let frameCallbacks: FrameRequestCallback[];
  let originalHistoryState: unknown;
  let originalUrl: string;

  beforeEach(() => {
    navigationType = 'navigate';
    scrollHeight = 2400;
    scrollX = 0;
    scrollY = 0;
    nextFrameId = 1;
    frameCallbacks = [];
    originalHistoryState = window.history.state;
    originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    window.sessionStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(window.performance, 'getEntriesByType').mockImplementation((type) =>
      type === 'navigation'
        ? ([{ type: navigationType }] as unknown as PerformanceEntry[])
        : [],
    );
    vi.spyOn(window, 'scrollX', 'get').mockImplementation(() => scrollX);
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockImplementation(
      () => scrollHeight,
    );
    vi.spyOn(window, 'scrollTo').mockImplementation((x, y) => {
      if (typeof x === 'number') {
        scrollX = x;
        scrollY = y ?? 0;
      }
    });
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return nextFrameId++;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(originalHistoryState, '', originalUrl);
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('saves the current viewport and restores it after a reload', () => {
    scrollX = 12;
    scrollY = 640;
    const saver = new ScrollRestorationService();
    saver.initialize();

    window.dispatchEvent(new Event('pagehide'));
    saver.ngOnDestroy();

    scrollX = 0;
    scrollY = 0;
    navigationType = 'reload';
    const restorer = new ScrollRestorationService();
    restorer.initialize();
    vi.runAllTimers();
    flushFrame();
    flushFrame();

    expect(window.scrollTo).toHaveBeenLastCalledWith(12, 640);
    expect(window.sessionStorage.length).toBe(0);
    restorer.ngOnDestroy();
  });

  it('restores cross-document back and forward navigations', () => {
    storePosition(0, 720);
    navigationType = 'back_forward';
    const service = new ScrollRestorationService();

    service.initialize();
    vi.runAllTimers();
    flushFrame();
    flushFrame();

    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 720);
    service.ngOnDestroy();
  });

  it('matches a saved route while static hydration still exposes a trailing slash', () => {
    window.history.replaceState(null, '', '/sample-blog/');
    window.sessionStorage.setItem(
      'lmms-lab-blog:scroll-position:/sample-blog',
      JSON.stringify({ url: '/sample-blog', x: 0, y: 900 }),
    );
    navigationType = 'reload';
    const service = new ScrollRestorationService();

    service.initialize();
    vi.runAllTimers();
    flushFrame();
    flushFrame();

    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 900);
    expect(window.sessionStorage.length).toBe(0);
    service.ngOnDestroy();
  });

  it('does not reuse a stored position during a fresh navigation', () => {
    storePosition(0, 720);
    const service = new ScrollRestorationService();

    service.initialize();
    vi.runAllTimers();

    expect(frameCallbacks).toHaveLength(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
    service.ngOnDestroy();
  });

  it('retries while hydrated content is still too short', () => {
    storePosition(0, 1000);
    navigationType = 'reload';
    scrollHeight = 900;
    const service = new ScrollRestorationService();

    service.initialize();
    vi.runAllTimers();
    flushFrame();
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 100);

    scrollHeight = 2200;
    flushFrame();
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 1000);
    expect(frameCallbacks).toHaveLength(0);
    service.ngOnDestroy();
  });

  it('ignores saved coordinates for a different URL', () => {
    window.sessionStorage.setItem(
      'lmms-lab-blog:scroll-position:/another-page',
      JSON.stringify({ url: '/another-page', x: 0, y: 500 }),
    );
    navigationType = 'reload';
    const service = new ScrollRestorationService();

    service.initialize();
    vi.runAllTimers();

    expect(frameCallbacks).toHaveLength(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.sessionStorage.length).toBe(1);
    service.ngOnDestroy();
  });

  function storePosition(x: number, y: number): void {
    window.sessionStorage.setItem(
      `lmms-lab-blog:scroll-position:${window.location.pathname}${window.location.search}${window.location.hash}`,
      JSON.stringify({
        url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        x,
        y,
      }),
    );
  }

  function flushFrame(): void {
    const callback = frameCallbacks.shift();
    expect(callback).toBeDefined();
    callback?.(performance.now());
  }
});
