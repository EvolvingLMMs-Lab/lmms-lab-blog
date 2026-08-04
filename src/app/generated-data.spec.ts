import { describe, expect, it } from 'vitest';
import { POSTS } from './data/posts';

describe('generated content data', () => {
  it('loads the generated post list', () => {
    expect(Array.isArray(POSTS)).toBe(true);
  });
});
