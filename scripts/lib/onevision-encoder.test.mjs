import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { parsePostSource } from './post-source.mjs';

const postDir = fileURLToPath(new URL('../../content/posts/onevision-encoder/', import.meta.url));
const sourcePath = fileURLToPath(
  new URL('../../content/posts/onevision-encoder/index.html', import.meta.url),
);
const source = readFileSync(sourcePath, 'utf8');
const article = JSDOM.fragment(parsePostSource(source, sourcePath).source);

test('preserves the OneVision Encoder source copy and result-table groups', () => {
  const text = article.textContent.replace(/\s+/g, ' ').trim();

  assert.match(text, /Left: Reference frame \(t=1\) with all patches\./);
  assert.match(
    text,
    /The visualization below demonstrates our complete video processing pipeline\./,
  );
  assert.match(text, /All models are evaluated on a unified multimodal setting/);
  assert.match(text, /does not perform temporal downsampling of the input video/);
  assert.match(text, /If you find our work useful, please consider citing our paper\./);

  const tables = article.querySelectorAll('.table-wrapper > table');
  assert.equal(tables.length, 3);
  assert.equal(tables[0].tHead.rows.length, 2);
  assert.equal(tables[0].tBodies[0].rows.length, 16);
  assert.equal(tables[1].tBodies[0].rows.length, 14);
  assert.deepEqual(
    Array.from(tables[1].querySelectorAll('.table-section-row'), (row) => row.textContent.trim()),
    ['8 Frames', '16 Frames'],
  );
  assert.equal(tables[2].tBodies[0].rows.length, 4);
  assert.deepEqual(
    Array.from(tables, (table) =>
      createHash('sha256').update(table.textContent.replace(/\s+/g, ' ').trim()).digest('hex'),
    ),
    [
      '3b20d3fb477b93ac30f8ea458054b9eef96b7153fe05da0b8d97bb8203f7b8eb',
      '941f39347b24f248c331dfd34f76ea838bc4caa09c1a20dcdf5be84b85d9b1c8',
      'ebf18bf2b6e2ab1d29a58d937bb1a69bc72f7bb38a3d0d03fe30511278d44fc2',
    ],
  );

  for (const wrapper of article.querySelectorAll('.table-wrapper')) {
    assert.ok(!wrapper.classList.contains('post-wide'));
    assert.equal(wrapper.getAttribute('role'), 'region');
    assert.ok(wrapper.getAttribute('aria-label'));
    assert.equal(wrapper.getAttribute('tabindex'), '0');
  }

  const resources = article.querySelector('.research-resource-card');
  assert.ok(resources?.classList.contains('research-resource-card--compact'));
  assert.ok(!resources?.classList.contains('post-wide'));
  assert.equal(article.querySelectorAll('html-fragment[wide]').length, 0);
  const methodFigure = article.querySelector(
    'figure.media-figure > img[alt*="method overview"]',
  )?.parentElement;
  assert.ok(methodFigure);
  assert.ok(!methodFigure.classList.contains('post-wide'));
  assert.ok(article.querySelector('video[aria-label*="Global contrastive"]'));
  assert.equal(article.querySelectorAll('.post-wide').length, 0);
});

test('keeps the complete OneVision Encoder patch and pipeline assets', () => {
  for (const directory of ['patches', 'patches-codec']) {
    const files = readdirSync(`${postDir}/interactive/${directory}`).filter((file) =>
      file.endsWith('.jpg'),
    );
    assert.equal(files.length, 256, `${directory} must contain all 256 source patches`);
  }

  const positions = JSON.parse(readFileSync(`${postDir}/interactive/codec-positions.json`, 'utf8'));
  assert.equal(positions.length, 256);
  for (const [time, row, column] of positions) {
    assert.ok(Number.isInteger(time) && time >= 0 && time < 64);
    assert.ok(Number.isInteger(row) && row >= 0 && row < 8);
    assert.ok(Number.isInteger(column) && column >= 0 && column < 8);
  }

  const pipeline = readFileSync(`${postDir}/pipeline/pipeline.mjs`, 'utf8');
  assert.match(pipeline, /const CASE_COUNT = 7;/);

  const pipelineFragment = JSDOM.fragment(
    readFileSync(`${postDir}/pipeline/pipeline.html`, 'utf8'),
  );
  assert.deepEqual(
    Array.from(pipelineFragment.querySelectorAll('.ov-pipeline__labels span'), (label) =>
      label.textContent.trim(),
    ),
    [
      'Original Video',
      'Uniform Frame Sampling',
      'Temporal Saliency Detection',
      'Codec-Style Patch Extraction',
    ],
  );
  const pipelineFigure = pipelineFragment.querySelector('.ov-pipeline');
  assert.equal(pipelineFigure?.children[0]?.className, 'ov-pipeline__panel');
  assert.equal(pipelineFigure?.children[1]?.tagName, 'FIGCAPTION');
  assert.ok(pipelineFigure?.children[2]?.classList.contains('ov-pipeline__navigation'));

  const pipelineStyles = readFileSync(`${postDir}/pipeline/pipeline.css`, 'utf8');
  assert.match(pipelineStyles, /\.ov-pipeline__viewport video\s*\{[\s\S]*aspect-ratio: auto;/);
  assert.ok(!existsSync(`${postDir}/codec-structure.avif`));
});
