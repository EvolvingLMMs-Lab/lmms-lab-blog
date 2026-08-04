import { describe, expect, it } from 'vitest';
import { POSTS } from './data/posts';

describe('generated content data', () => {
  it('loads the generated post list', () => {
    expect(Array.isArray(POSTS)).toBe(true);
    expect(POSTS.length).toBeGreaterThan(0);
  });

  it('produces complete, unique publishable records', () => {
    const slugs = new Set<string>();

    for (const post of POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.title.trim()).not.toBe('');
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.description.trim()).not.toBe('');
      expect(post.contentHtml.trim()).not.toBe('');
      expect(post.contentHtml).not.toContain('<html-fragment');
      expect(post.contentHtml).not.toContain('<iframe');
      slugs.add(post.slug);
    }

    expect(slugs.size).toBe(POSTS.length);
  });
});
