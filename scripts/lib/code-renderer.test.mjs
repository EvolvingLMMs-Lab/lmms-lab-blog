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
