import { afterEach, describe, expect, it, vi } from 'vitest';
import { TocItem } from '../models/post.model';
import {
  HeadingObserver,
  calculateReadingProgress,
  flattenToc,
  resolveActiveHeading,
} from './heading-observer';

const tocItems: TocItem[] = [
  {
    id: 'first',
    text: 'First',
    level: 2,
    children: [{ id: 'second', text: 'Second', level: 3, children: [] }],
  },
  { id: 'third', text: 'Third', level: 2, children: [] },
];

function rectAt(top: number, height = 30): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    right: 100,
    bottom: top + height,
    left: 0,
    width: 100,
    height,
    toJSON: () => ({}),
  };
}

describe('resolveActiveHeading', () => {
  const headings = [
    { id: 'one', top: 160 },
    { id: 'two', top: 480 },
    { id: 'three', top: 900 },
  ];

  it('has no active section before the first heading reaches the activation line', () => {
    expect(resolveActiveHeading(headings, 80, false)).toBe('');
  });

  it('chooses the last heading above the activation line', () => {
    expect(
      resolveActiveHeading(
        [
          { id: 'one', top: -220 },
          { id: 'two', top: 40 },
          { id: 'three', top: 400 },
        ],
        80,
        false,
      ),
    ).toBe('two');
  });

  it('activates the final section at the bottom of the page', () => {
    expect(resolveActiveHeading(headings, 80, true)).toBe('three');
  });
});

describe('calculateReadingProgress', () => {
  it('clamps progress before and after the readable article range', () => {
    expect(calculateReadingProgress(200, 1200, 600, 80)).toBe(0);
    expect(calculateReadingProgress(-600, 1200, 600, 80)).toBe(1);
  });

  it('reports progress within the article', () => {
    expect(calculateReadingProgress(-260, 1200, 600, 80)).toBe(0.5);
  });
});

describe('flattenToc', () => {
  it('preserves document order', () => {
    expect(flattenToc(tocItems).map((item) => item.id)).toEqual(['first', 'second', 'third']);
  });
});

describe('HeadingObserver', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('updates the active heading after a jump scroll and tracks article progress', () => {
    document.body.innerHTML = `
      <article>
        <h2 id="first">First</h2>
        <h3 id="second">Second</h3>
        <h2 id="third">Third</h2>
      </article>
    `;

    const frameCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const positions = new Map([
      ['first', 200],
      ['second', 500],
      ['third', 800],
    ]);
    const article = document.querySelector<HTMLElement>('article')!;
    vi.spyOn(article, 'getBoundingClientRect').mockImplementation(() => rectAt(120, 1400));

    for (const heading of Array.from(article.querySelectorAll<HTMLElement>('h2, h3'))) {
      vi.spyOn(heading, 'getBoundingClientRect').mockImplementation(() =>
        rectAt(positions.get(heading.id) ?? 0),
      );
    }

    const observer = new HeadingObserver();
    observer.observe(article, tocItems, null);
    frameCallbacks.shift()?.(0);
    expect(observer.activeHeadingId()).toBe('');
    expect(observer.readingProgress()).toBe(0);

    positions.set('first', -700);
    positions.set('second', -400);
    positions.set('third', -100);
    vi.spyOn(article, 'getBoundingClientRect').mockImplementation(() => rectAt(-500, 1400));
    window.dispatchEvent(new Event('scroll'));
    frameCallbacks.shift()?.(0);

    expect(observer.activeHeadingId()).toBe('third');
    expect(observer.readingProgress()).toBeGreaterThan(0);
    observer.disconnect();
  });
});
