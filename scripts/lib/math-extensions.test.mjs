import assert from 'node:assert/strict';
import test from 'node:test';
import { Marked } from 'marked';
import { mathBlock, mathInline } from './math-extensions.mjs';

test('marks inline and display mathematics for on-demand MathJax loading', () => {
  const renderer = new Marked({ extensions: [mathBlock, mathInline] });
  const html = renderer.parse('The budget is $N < T$.\n\n$$q & k$$', { async: false });

  assert.match(html, /<span class="math-inline">\\\(N &lt; T\\\)<\/span>/);
  assert.match(html, /<div class="math-display">\\\[q &amp; k\\\]<\/div>/);
});
