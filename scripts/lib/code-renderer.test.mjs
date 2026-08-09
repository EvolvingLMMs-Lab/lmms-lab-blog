import assert from 'node:assert/strict';
import test from 'node:test';
import { createCodeRenderer } from './code-renderer.mjs';

test('renders one light code theme through the site palette variables', () => {
  const highlighter = {
    getLoadedLanguages: () => ['python'],
    codeToHtml: (_text, options) => {
      assert.equal(options.theme, 'catppuccin-latte');
      assert.equal(options.themes, undefined);
      return '<pre class="shiki catppuccin-latte" style="background-color:#EFF1F5;color:#4C4F69"><code><span style="color:#8839EF">def</span></code></pre>';
    },
  };

  const html = createCodeRenderer(highlighter)({ text: 'def', lang: 'python' });

  assert.match(html, /background-color:var\(--ctp-base\)/);
  assert.match(html, /color:var\(--ctp-text\)/);
  assert.match(html, /color:var\(--ctp-mauve\)/);
  assert.doesNotMatch(html, /shiki-dark|catppuccin-mocha/);
});

test('renders quoted titles and optional copy controls from fence metadata', () => {
  const highlighter = {
    getLoadedLanguages: () => ['bash', 'text'],
    codeToHtml: (text, options) => `<pre class="shiki ${options.lang}"><code>${text}</code></pre>`,
  };
  const render = createCodeRenderer(highlighter);

  const titled = render({ text: 'pnpm build', lang: 'bash title="Production build"' });
  assert.match(titled, /class="code-title">Production build<\/span>/);
  assert.match(titled, /class="code-lang">bash<\/span>/);
  assert.match(titled, /class="code-copy"/);

  const displayOnly = render({ text: 'input → output', lang: 'text copy=false' });
  assert.doesNotMatch(displayOnly, /class="code-copy"/);
});
