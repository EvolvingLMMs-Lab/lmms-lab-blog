import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { replaceLocationHash } from './location-hash';

describe('replaceLocationHash', () => {
  let originalState: unknown;
  let originalUrl: string;

  beforeEach(() => {
    originalState = window.history.state;
    originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  });

  afterEach(() => {
    document.head.querySelector('base[data-location-hash-test]')?.remove();
    window.history.replaceState(originalState, '', originalUrl);
  });

  it('keeps the current path and query when the document base points to the site root', () => {
    const base = document.createElement('base');
    base.href = '/';
    base.dataset['locationHashTest'] = '';
    document.head.append(base);

    const routerState = { navigationId: 42, ɵrouterPageId: 3 };
    window.history.replaceState(routerState, '', '/sample-blog?preview=true');

    replaceLocationHash('local-images');

    expect(window.location.pathname).toBe('/sample-blog');
    expect(window.location.search).toBe('?preview=true');
    expect(window.location.hash).toBe('#local-images');
    expect(window.history.state).toEqual(routerState);
  });

  it('encodes heading IDs without changing the current page', () => {
    window.history.replaceState(null, '', '/sample-blog');

    replaceLocationHash('模型 100%');

    expect(window.location.pathname).toBe('/sample-blog');
    expect(decodeURIComponent(window.location.hash.slice(1))).toBe('模型 100%');
  });
});
