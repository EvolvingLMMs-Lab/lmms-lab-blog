import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { Marked } from 'marked';
import { renderWebEmbeds, webEmbedBlock } from './web-embed-renderer.mjs';

function render(markdown) {
  const parser = new Marked({ extensions: [webEmbedBlock] });
  const html = parser.parse(markdown, { async: false });
  const dom = new JSDOM(`<body>${html}</body>`, {
    url: 'https://blog.example.test/article',
  });
  renderWebEmbeds(dom.window.document);
  return dom.window.document.body;
}

test('renders a multiline web embed as an interactive, sandboxed figure', () => {
  const body = render(`<web-embed
  src="/demos/example/index.html#interactive"
  title="Example interactive demo"
  caption="A generic fixture, independent of blog content."
  height="9999"
  wide
></web-embed>`);

  const figure = body.querySelector('.web-embed');
  const iframe = body.querySelector('iframe');

  assert.ok(figure?.classList.contains('web-embed--wide'));
  assert.equal(figure?.style.getPropertyValue('--web-embed-height'), '1200px');
  assert.equal(figure?.dataset['webEmbedSource'], '/demos/example/index.html#interactive');
  assert.equal(iframe?.getAttribute('src'), '/demos/example/index.html#interactive');
  assert.equal(iframe?.getAttribute('loading'), 'lazy');
  assert.match(iframe?.getAttribute('sandbox') ?? '', /allow-scripts/);
  assert.ok(body.querySelector('.web-embed__reload'));
  assert.ok(body.querySelector('.web-embed__fullscreen'));
  assert.equal(body.querySelector('web-embed'), null);
});

test('rejects insecure embed URLs during content generation', () => {
  assert.throws(
    () => render('<web-embed src="http://example.test/demo"></web-embed>'),
    /only supports HTTPS or root-relative URLs/,
  );
});
