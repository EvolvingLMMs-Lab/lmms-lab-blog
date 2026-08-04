import { describe, expect, it } from 'vitest';
import { POSTS } from './data/posts';

describe('generated content data', () => {
  it('loads the generated post list', () => {
    expect(Array.isArray(POSTS)).toBe(true);
  });

  it('renders the sample post features', () => {
    const sample = POSTS.find(post => post.slug === 'sample-blog');

    expect(sample).toBeDefined();
    expect(sample?.contentHtml).toContain('<strong>strong text</strong>');
    expect(sample?.contentHtml).toContain('<div class="math-display">');
    expect(sample?.contentHtml).toContain(
      '<img src="/posts/sample-blog/multimodal-flow.avif"',
    );
    expect(sample?.contentHtml).toContain('width="1440" height="810"');
  });

  it('renders the migrated OneVision Encoder article', () => {
    const post = POSTS.find(item => item.slug === 'onevision-encoder');

    expect(post).toBeDefined();
    expect(post?.contentHtml).toContain('/posts/onevision-encoder/method.avif');
    expect(post?.contentHtml).toContain('/posts/onevision-encoder/codec-structure.avif');
    expect(post?.contentHtml).toContain('<video controls="" autoplay=""');
    expect(post?.contentHtml).toContain('<div class="table-wrapper"><table>');
    expect(post?.contentHtml).toContain('<span class="code-lang">bibtex</span>');
    expect(post?.contentHtml).toContain('onevision_encoder_2026');
  });
});
