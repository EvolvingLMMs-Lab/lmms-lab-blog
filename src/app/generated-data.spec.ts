import { describe, expect, it } from 'vitest';
import { AUTHORING_DOCS_HTML, AUTHORING_DOCS_TOC } from './data/authoring-docs';
import { POSTS } from './data/posts';
import { TocItem } from './models/post.model';

function flattenIds(items: readonly TocItem[]): string[] {
  return items.flatMap((item) => [item.id, ...flattenIds(item.children)]);
}

function headingIds(html: string): string[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(document.querySelectorAll<HTMLElement>('h2[id], h3[id]')).map(
    (heading) => heading.id,
  );
}

describe('generated content data', () => {
  it('loads the generated post list', () => {
    expect(Array.isArray(POSTS)).toBe(true);
    expect(POSTS.length).toBeGreaterThan(0);
  });

  it('generates the online guide from the canonical authoring document', () => {
    expect(AUTHORING_DOCS_HTML).toContain('<h1>Blog authoring guide</h1>');
    expect(AUTHORING_DOCS_HTML).toContain('&lt;blog-video');
    expect(AUTHORING_DOCS_HTML).toContain('class="code-copy"');
    expect(flattenIds(AUTHORING_DOCS_TOC)).toEqual(headingIds(AUTHORING_DOCS_HTML));
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
      expect(flattenIds(post.toc)).toEqual(headingIds(post.contentHtml));
      expect(new Set(flattenIds(post.toc)).size).toBe(flattenIds(post.toc).length);
      slugs.add(post.slug);
    }

    expect(slugs.size).toBe(POSTS.length);
  });
});
