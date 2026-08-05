import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadingObserver } from './heading-observer';
import { TocItem } from './toc-builder';

const tocItems: TocItem[] = [
  { id: 'first', text: 'First', level: 2 },
  { id: 'second', text: 'Second', level: 2 },
  { id: 'third', text: 'Third', level: 2 },
];

function rectAt(top: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    right: 100,
    bottom: top + 30,
    left: 0,
    width: 100,
    height: 30,
    toJSON: () => ({}),
  };
}

describe('HeadingObserver', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('updates the active heading after a jump scroll that skips intersection states', () => {
    document.body.innerHTML = tocItems.map(item => `<h2 id="${item.id}">${item.text}</h2>`).join('');

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        disconnect(): void {}
      },
    );

    const frameCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return 1;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const positions = new Map([
      ['first', 200],
      ['second', 500],
      ['third', 800],
    ]);

    for (const heading of Array.from(document.querySelectorAll<HTMLElement>('h2'))) {
      vi.spyOn(heading, 'getBoundingClientRect').mockImplementation(() =>
        rectAt(positions.get(heading.id) ?? 0),
      );
    }

    const observer = new HeadingObserver();
    observer.observe(tocItems, null);
    expect(observer.activeHeadingId()).toBe('first');

    positions.set('first', -700);
    positions.set('second', -400);
    positions.set('third', -100);
    window.dispatchEvent(new Event('scroll'));
    expect(frameCallbacks).toHaveLength(1);

    frameCallbacks[0](0);
    expect(observer.activeHeadingId()).toBe('third');
    observer.disconnect();
  });
});
