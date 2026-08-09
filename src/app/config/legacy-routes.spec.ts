import { describe, expect, it } from 'vitest';
import { POSTS } from '../data/posts';
import {
  LEGACY_NOTE_ROUTES,
  LEGACY_POST_ROUTES,
  legacyArticlePath,
  normalizeLegacySlug,
} from './legacy-routes';

describe('legacy Angular routes', () => {
  const routes = [...LEGACY_POST_ROUTES, ...LEGACY_NOTE_ROUTES];
  const postSlugs = new Set(POSTS.map((post) => post.slug));

  it('maps every historical article URL to generated Angular content', () => {
    for (const route of routes) {
      expect(normalizeLegacySlug(route.legacySlug)).toBe(route.blogSlug);
      expect(postSlugs.has(route.blogSlug), route.blogSlug).toBe(true);
    }
  });

  it('keeps route slugs unique within each archive', () => {
    expect(new Set(LEGACY_POST_ROUTES.map((route) => route.legacySlug)).size).toBe(
      LEGACY_POST_ROUTES.length,
    );
    expect(new Set(LEGACY_NOTE_ROUTES.map((route) => route.legacySlug)).size).toBe(
      LEGACY_NOTE_ROUTES.length,
    );
  });

  it('preserves the standalone OneVision Encoder URL', () => {
    expect(legacyArticlePath('onevision-encoder', 'posts')).toBe('/onevision-encoder');
    expect(legacyArticlePath('diffusion-language-models', 'notes')).toBe('/notes/dllm');
  });
});
