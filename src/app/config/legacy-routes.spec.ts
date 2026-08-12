import { describe, expect, it } from 'vitest';
import { POSTS } from '../data/posts';
import {
  LEGACY_NOTE_ROUTES,
  LEGACY_POST_ROUTES,
  legacyBlogPath,
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

  it('redirects historical article slugs to canonical blog URLs', () => {
    expect(legacyBlogPath('onevision_encoder', 'posts')).toBe('/blog/onevision-encoder');
    expect(legacyBlogPath('llava_critic_r1', 'posts')).toBe('/blog/llava-critic-r1');
    expect(legacyBlogPath('dllm', 'notes')).toBe('/blog/diffusion-language-models');
    expect(legacyBlogPath('wake-up', 'notes')).toBe('/blog/digital-tide');
  });

  it('keeps unknown legacy slugs under the canonical blog namespace', () => {
    expect(legacyBlogPath('future_article', 'posts')).toBe('/blog/future_article');
  });
});
