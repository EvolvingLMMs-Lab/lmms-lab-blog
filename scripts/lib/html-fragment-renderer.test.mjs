import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Marked } from 'marked';
import {
  htmlFragmentBlock,
  normalizeHtmlAssets,
  renderHtmlFragments,
} from './html-fragment-renderer.mjs';

function createFixture(t, fragment) {
  const root = mkdtempSync(join(tmpdir(), 'lmms-blog-html-'));
  const postsDir = join(root, 'posts');
  const postDir = join(postsDir, 'example');
  mkdirSync(join(postDir, 'interactive'), { recursive: true });
  writeFileSync(join(postDir, 'interactive.html'), fragment, 'utf-8');
  writeFileSync(join(postDir, 'interactive', 'preview.avif'), 'fixture', 'utf-8');
  writeFileSync(join(postDir, 'interactive', 'styles.css'), '.fixture { color: teal; }', 'utf-8');
  writeFileSync(
    join(postDir, 'interactive', 'controller.mjs'),
    'export function mount() {}',
    'utf-8',
  );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { postsDir, postDir };
}

function render(
  t,
  fragment,
  markdown = '<html-fragment src="./interactive.html" wide></html-fragment>',
) {
  const { postsDir, postDir } = createFixture(t, fragment);
  const parser = new Marked({ extensions: [htmlFragmentBlock] });
  const html = parser.parse(markdown, { async: false });
  const dom = new JSDOM(`<body>${html}</body>`);
  const { document } = dom.window;

  renderHtmlFragments(document, {
    postsDir,
    slug: 'example',
    getImageDimensions: () => ({ width: 640, height: 360 }),
  });
  normalizeHtmlAssets(document, {
    baseDir: postDir,
    postDir,
    slug: 'example',
    getImageDimensions: () => ({ width: 640, height: 360 }),
  });
  return document.body;
}

test('inlines native HTML, scoped styles, local assets, and a local controller', (t) => {
  const body = render(
    t,
    `<style>.demo { color: teal; }</style>
<section class="demo" data-blog-controller="./interactive/controller.mjs">
  <img src="./interactive/preview.avif" alt="Preview">
</section>`,
  );

  const wrapper = body.querySelector('.html-fragment');
  const image = body.querySelector('img');
  const controller = body.querySelector('[data-blog-controller]');

  assert.ok(wrapper?.classList.contains('html-fragment--wide'));
  assert.match(wrapper?.querySelector('style')?.textContent ?? '', /color: teal/);
  assert.equal(
    controller?.getAttribute('data-blog-controller'),
    '/posts/example/interactive/controller.mjs',
  );
  assert.equal(image?.getAttribute('src'), '/posts/example/interactive/preview.avif');
  assert.equal(image?.getAttribute('data-zoom-src'), '/posts/example/interactive/preview.avif');
  assert.equal(image?.getAttribute('width'), '640');
  assert.equal(image?.getAttribute('height'), '360');
  assert.equal(image?.getAttribute('loading'), 'lazy');
  assert.equal(body.querySelector('html-fragment'), null);
});

test('inserts a default fragment directly into the Markdown document flow', (t) => {
  const body = render(
    t,
    '<section class="seamless"><p>Native HTML between Markdown blocks.</p></section>',
    'Before.\n\n<html-fragment src="./interactive.html"></html-fragment>\n\nAfter.',
  );

  const section = body.querySelector('.seamless');
  assert.equal(section?.parentElement, body);
  assert.equal(body.querySelector('.html-fragment'), null);
  assert.match(body.textContent ?? '', /Before[\s\S]*Native HTML[\s\S]*After/);
});

test('inlines a fragment-local stylesheet into the document flow', (t) => {
  const body = render(
    t,
    '<link rel="stylesheet" href="./interactive/styles.css"><section class="fixture"></section>',
    '<html-fragment src="./interactive.html"></html-fragment>',
  );

  const style = body.querySelector('style[data-html-stylesheet]');
  assert.match(style?.textContent ?? '', /color: teal/);
  assert.equal(body.querySelector('link[rel="stylesheet"]'), null);
});

test('rewrites post-local video sources, posters, and caption tracks', (t) => {
  const body = render(
    t,
    `<video controls src="./interactive/preview.mp4" poster="./interactive/poster.avif">
  <source src="./interactive/preview.webm" type="video/webm">
  <track kind="captions" src="./interactive/preview.en.vtt" srclang="en">
</video>`,
  );
  const video = body.querySelector('video');

  assert.equal(video?.getAttribute('src'), '/posts/example/interactive/preview.mp4');
  assert.equal(video?.getAttribute('poster'), '/posts/example/interactive/poster.avif');
  assert.equal(
    video?.querySelector('source')?.getAttribute('src'),
    '/posts/example/interactive/preview.webm',
  );
  assert.equal(
    video?.querySelector('track')?.getAttribute('src'),
    '/posts/example/interactive/preview.en.vtt',
  );
});

test('rejects iframe content', (t) => {
  assert.throws(
    () => render(t, '<iframe src="https://example.test"></iframe>'),
    /cannot contain iframes/,
  );
});

test('rejects scripts in native fragments', (t) => {
  assert.throws(() => render(t, '<script>alert(1)</script>'), /cannot contain script tags/);
});

test('keeps fragment sources inside the post asset directory', (t) => {
  const { postsDir } = createFixture(t, '<p>Safe</p>');
  const dom = new JSDOM('<body><html-fragment src="../outside.html"></html-fragment></body>');

  assert.throws(
    () => renderHtmlFragments(dom.window.document, { postsDir, slug: 'example' }),
    /escapes the post asset directory/,
  );
});

test('rejects remote controller modules', (t) => {
  assert.throws(
    () =>
      render(t, '<section data-blog-controller="https://example.test/controller.mjs"></section>'),
    /must reference a local module/,
  );
});

test('rejects missing controller modules', (t) => {
  assert.throws(
    () => render(t, '<section data-blog-controller="./missing.mjs"></section>'),
    /Blog controller does not exist/,
  );
});
