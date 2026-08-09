import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { discoverPostSources, parsePostSource } from './post-source.mjs';

function createPostsFixture(t) {
  const postsDir = mkdtempSync(join(tmpdir(), 'lmms-blog-posts-'));
  t.after(() => rmSync(postsDir, { recursive: true, force: true }));
  return postsDir;
}

function source(body = '## Introduction\n\nArticle body.\n') {
  return `---
title: A test post
date: '2026-08-06'
description: >-
  A multiline description that is folded into one string.
authors:
  - name: Ada Lovelace
    url: https://example.com/ada
    main: true
  - name: Alan Turing
tags: [research, models]
---

${body}`;
}

test('parses strict YAML front matter and removes it from the article body', () => {
  const parsed = parsePostSource(source(), '/posts/example/index.md');

  assert.deepEqual(parsed.meta, {
    title: 'A test post',
    date: '2026-08-06',
    description: 'A multiline description that is folded into one string.',
    authors: [
      { name: 'Ada Lovelace', url: 'https://example.com/ada', main: true },
      { name: 'Alan Turing' },
    ],
    tags: ['research', 'models'],
    layout: 'standard',
  });
  assert.doesNotMatch(parsed.source, /title: A test post/);
  assert.match(parsed.source, /^\n## Introduction/);
});

test('discovers one index source per post directory and ignores colocated assets', (t) => {
  const postsDir = createPostsFixture(t);
  const markdownDir = join(postsDir, 'markdown-post');
  const htmlDir = join(postsDir, 'html-post');
  mkdirSync(markdownDir);
  mkdirSync(htmlDir);
  writeFileSync(join(markdownDir, 'index.md'), source(), 'utf-8');
  writeFileSync(join(markdownDir, 'result.avif'), 'fixture', 'utf-8');
  writeFileSync(join(htmlDir, 'index.html'), source('<h2>HTML article</h2>'), 'utf-8');

  const posts = discoverPostSources(postsDir);

  assert.deepEqual(
    posts.map(({ slug, format }) => ({ slug, format })),
    [
      { slug: 'html-post', format: 'html' },
      { slug: 'markdown-post', format: 'markdown' },
    ],
  );
  assert.match(posts[0].source, /<h2>HTML article<\/h2>/);
});

test('rejects a post directory with both index formats', (t) => {
  const postsDir = createPostsFixture(t);
  const postDir = join(postsDir, 'duplicate-post');
  mkdirSync(postDir);
  writeFileSync(join(postDir, 'index.md'), source(), 'utf-8');
  writeFileSync(join(postDir, 'index.html'), source('<p>Duplicate</p>'), 'utf-8');

  assert.throws(
    () => discoverPostSources(postsDir),
    /must have exactly one source file: index\.md or index\.html/,
  );
});

test('rejects loose legacy post files', (t) => {
  const postsDir = createPostsFixture(t);
  writeFileSync(join(postsDir, 'legacy-post.md'), source(), 'utf-8');

  assert.throws(() => discoverPostSources(postsDir), /Loose post sources are not supported/);
});

test('rejects missing, malformed, and unknown metadata', () => {
  assert.throws(
    () => parsePostSource('## Missing front matter', 'index.md'),
    /must start with YAML front matter/,
  );
  assert.throws(
    () => parsePostSource(source().replace("date: '2026-08-06'", "date: '2026-02-30'")),
    /invalid calendar date/,
  );
  assert.throws(
    () => parsePostSource(source().replace('description:', 'draft: false\ndescription:')),
    /unknown front matter field\(s\): draft/,
  );
  assert.throws(
    () => parsePostSource(source().replace('title: A test post', 'title: [broken')),
    /invalid YAML front matter/,
  );
});

test('defaults optional authors and tags to empty sequences', () => {
  const parsed = parsePostSource(
    source().replace(/authors:[\s\S]*?tags: \[research, models\]\n/, ''),
    'index.md',
  );

  assert.deepEqual(parsed.meta.authors, []);
  assert.deepEqual(parsed.meta.tags, []);
});

test('rejects malformed author and tag metadata', () => {
  assert.throws(
    () => parsePostSource(source().replace('main: true', 'main: yes')),
    /must define "main" as a boolean/,
  );
  assert.throws(
    () => parsePostSource(source().replace('tags: [research, models]', 'tags: research')),
    /must define "tags" as a YAML sequence/,
  );
  assert.throws(
    () =>
      parsePostSource(source().replace('tags: [research, models]', 'tags: [research, research]')),
    /must not define duplicate tags/,
  );
  assert.throws(
    () =>
      parsePostSource(
        source().replace('tags: [research, models]', 'layout: immersive\ntags: [research, models]'),
      ),
    /must define "layout" as "standard" or "showcase"/,
  );
});
