import { afterEach, describe, expect, it, vi } from 'vitest';
import { jumpScrollTo, smoothScrollTo } from './smooth-scroll';

describe('scroll helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('jumps without inheriting the document smooth-scroll rule', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    jumpScrollTo(640, 12);

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, left: 12, behavior: 'instant' });
  });

  it('jumps immediately when the reader prefers reduced motion', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));

    smoothScrollTo(320);

    expect(scrollTo).toHaveBeenCalledWith({ top: 320, left: 0, behavior: 'instant' });
  });

  it('animates with instant frame updates when motion is allowed', () => {
    const frames: FrameRequestCallback[] = [];
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(100);
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      }),
    );

    const handle = smoothScrollTo(300, 100);
    frames.shift()?.(1050);

    expect(scrollTo).toHaveBeenLastCalledWith({ top: 200, left: 0, behavior: 'instant' });
    handle.cancel();
  });
});
