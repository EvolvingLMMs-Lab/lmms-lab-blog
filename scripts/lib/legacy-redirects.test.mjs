import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const redirects = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8');
const postRoutes = [
  ['onevision_encoder', 'onevision-encoder'],
  ['llava_onevision_2', 'llava-onevision-2'],
  ['llava_onevision_1.5_rl', 'llava-onevision-1-5-rl'],
  ['longvt', 'longvt'],
  ['openmmreasoner', 'openmmreasoner'],
  ['llava_onevision_1_5', 'llava-onevision-1-5'],
  ['llava_critic_r1', 'llava-critic-r1'],
  ['mmsearch_r1_improved', 'mmsearch-r1-improved'],
  ['sae_made_easy', 'sae-made-easy'],
  ['mmsearch_r1', 'mmsearch-r1'],
  ['aero_audio', 'aero-audio'],
  ['highres_visual_reasoning', 'highres-visual-reasoning'],
  ['llava_next_video', 'llava-next-video'],
  ['llava_onevision', 'llava-onevision'],
  ['lmms_eval', 'lmms-eval'],
  ['longva', 'longva'],
  ['multimodal_sae', 'multimodal-sae'],
  ['videommmu', 'videommmu'],
];
const noteRoutes = [
  ['dllm', 'diffusion-language-models'],
  ['wake-up', 'digital-tide'],
];

function assertRedirect(source, destination) {
  assert.match(redirects, new RegExp(`^${source} ${destination} 301$`, 'm'));
  assert.match(redirects, new RegExp(`^${source}/ ${destination} 301$`, 'm'));
}

test('permanently redirects both legacy collections to the unified blog', () => {
  assertRedirect('/posts', '/blog/');
  assertRedirect('/notes', '/blog/');
});

test('permanently redirects every known legacy article URL with or without a trailing slash', () => {
  for (const [legacySlug, blogSlug] of postRoutes) {
    assertRedirect(`/posts/${legacySlug}`, `/blog/${blogSlug}/`);
  }
  for (const [legacySlug, blogSlug] of noteRoutes) {
    assertRedirect(`/notes/${legacySlug}`, `/blog/${blogSlug}/`);
  }
});

test('keeps fallback rules for future legacy slugs', () => {
  assert.match(redirects, /^\/posts\/:slug \/blog\/:slug\/ 301$/m);
  assert.match(redirects, /^\/posts\/:slug\/ \/blog\/:slug\/ 301$/m);
  assert.match(redirects, /^\/notes\/:slug \/blog\/:slug\/ 301$/m);
  assert.match(redirects, /^\/notes\/:slug\/ \/blog\/:slug\/ 301$/m);
});
