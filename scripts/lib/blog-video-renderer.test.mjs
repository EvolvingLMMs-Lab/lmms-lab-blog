import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Marked } from 'marked';
import { blogVideoBlock, renderBlogVideos } from './blog-video-renderer.mjs';
import { normalizeHtmlAssets } from './html-fragment-renderer.mjs';

function render(markdown) {
  const parser = new Marked({ extensions: [blogVideoBlock] });
  const html = parser.parse(markdown, { async: false });
  const dom = new JSDOM(`<body>${html}</body>`);
  const { document } = dom.window;

  renderBlogVideos(document);
  normalizeHtmlAssets(document, {
    baseDir: '/content/posts/example',
    postDir: '/content/posts/example',
    slug: 'example',
  });

  return document.body;
}

test('expands the minimal blog video syntax into a Vidstack-ready native fallback', () => {
  const body = render('<blog-video src="./demo.m3u8"></blog-video>\n\nThe article continues.');
  const figure = body.querySelector('figure');
  const video = figure?.querySelector('video');
  const source = video?.querySelector('source');

  assert.equal(figure?.parentElement, body);
  assert.ok(figure?.classList.contains('media-figure'));
  assert.equal(figure?.getAttribute('data-blog-video'), '');
  assert.ok(video?.hasAttribute('controls'));
  assert.ok(video?.hasAttribute('playsinline'));
  assert.equal(video?.getAttribute('preload'), 'metadata');
  assert.equal(video?.getAttribute('width'), '1280');
  assert.equal(video?.getAttribute('height'), '720');
  assert.equal(video?.getAttribute('aria-label'), 'Article video');
  assert.equal(source?.getAttribute('src'), '/posts/example/demo.m3u8');
  assert.equal(source?.getAttribute('type'), 'application/vnd.apple.mpegurl');
  assert.match(body.textContent ?? '', /The article continues/);
  assert.equal(body.querySelector('blog-video'), null);
});

test('supports a poster, caption, playback options, fallback sources, and captions', () => {
  const body = render(`<blog-video
  src="./demo.m3u8"
  poster="./poster.avif"
  caption="A compact pipeline comparison."
  width="960"
  height="540"
  muted
  loop
>
  <source src="./demo.mp4" type="video/mp4">
  <track kind="captions" src="./demo.en.vtt" srclang="en" label="English">
</blog-video>`);
  const video = body.querySelector('video');
  const sources = Array.from(video?.querySelectorAll('source') ?? []);

  assert.equal(video?.getAttribute('poster'), '/posts/example/poster.avif');
  assert.equal(video?.getAttribute('aria-label'), 'A compact pipeline comparison.');
  assert.equal(video?.getAttribute('width'), '960');
  assert.equal(video?.getAttribute('height'), '540');
  assert.ok(video?.hasAttribute('muted'));
  assert.ok(video?.hasAttribute('loop'));
  assert.deepEqual(
    sources.map((source) => [source.getAttribute('src'), source.getAttribute('type')]),
    [
      ['/posts/example/demo.m3u8', 'application/vnd.apple.mpegurl'],
      ['/posts/example/demo.mp4', 'video/mp4'],
    ],
  );
  assert.equal(video?.querySelector('track')?.getAttribute('src'), '/posts/example/demo.en.vtt');
  assert.equal(body.querySelector('figcaption')?.textContent, 'A compact pipeline comparison.');
});

test('infers media types through URL query strings and accepts an explicit type', () => {
  const inferred = render(
    '<blog-video src="https://media.example.test/demo.webm?download=1"></blog-video>',
  );
  const explicit = render(
    '<blog-video src="https://media.example.test/stream" type="video/mp4"></blog-video>',
  );

  assert.equal(inferred.querySelector('source')?.getAttribute('type'), 'video/webm');
  assert.equal(explicit.querySelector('source')?.getAttribute('type'), 'video/mp4');
});

test('rejects a blog video without a source', () => {
  assert.throws(() => render('<blog-video></blog-video>'), /requires a non-empty src attribute/);
});
