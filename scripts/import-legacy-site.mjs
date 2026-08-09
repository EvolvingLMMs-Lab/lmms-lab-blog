import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const TARGET_POSTS_DIR = join(PROJECT_ROOT, 'content/posts');
const LEGACY_ROOT = resolve(process.argv[2] || '');
const SYNC_METADATA = process.argv.includes('--sync-metadata');
const SYNC_CONTENT = process.argv.includes('--sync-content');
const LEGACY_POSTS_DIR = join(LEGACY_ROOT, 'content/posts');
const LEGACY_NOTES_DIR = join(LEGACY_ROOT, 'content/notes');
const SITE_ASSETS_DIR = join(PROJECT_ROOT, 'public/site');

if (!process.argv[2] || !existsSync(LEGACY_POSTS_DIR)) {
  throw new Error('Usage: node scripts/import-legacy-site.mjs /path/to/lmms-lab-website');
}

const LEGACY_AUTHOR_URLS = new Map([
  ['Bo Li', 'https://brianboli.com/'],
  ['Ziwei Liu', 'https://liuziwei7.github.io/'],
]);

const imported = [];
const resumed = [];
const synchronized = [];
const warnings = [];

function repairMultilineQuotedField(yamlSource, field) {
  const lines = yamlSource.split(/\r?\n/);
  const startPattern = new RegExp(`^${field}:\\s*"(.*)$`);

  for (let index = 0; index < lines.length; index += 1) {
    const match = startPattern.exec(lines[index]);
    if (!match || /(^|[^\\])"\s*$/.test(match[1])) continue;

    const valueLines = [match[1]];
    let endIndex = index + 1;
    for (; endIndex < lines.length; endIndex += 1) {
      const line = lines[endIndex];
      if (/(^|[^\\])"\s*$/.test(line)) {
        valueLines.push(line.replace(/"\s*$/, ''));
        break;
      }
      valueLines.push(line);
    }

    if (endIndex >= lines.length) continue;
    lines.splice(
      index,
      endIndex - index + 1,
      `${field}: |-`,
      ...valueLines.map((line) => `  ${line}`),
    );
  }

  return lines.join('\n');
}

function splitFrontMatter(source, sourcePath) {
  const match = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/.exec(source);
  if (!match) {
    throw new Error(`Legacy source ${sourcePath} has no YAML front matter`);
  }

  let meta;
  try {
    meta = parse(match[1]);
  } catch (error) {
    const repaired = repairMultilineQuotedField(match[1], 'bibtex');
    try {
      meta = parse(repaired);
      warnings.push(`Repaired malformed multiline BibTeX metadata in ${sourcePath}`);
    } catch {
      throw new Error(`Cannot parse YAML metadata in ${sourcePath}: ${error.message}`, {
        cause: error,
      });
    }
  }

  return { meta, body: source.slice(match[0].length) };
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function stripMarkdown(value) {
  return String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_>#~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferDescription(body) {
  const withoutFrontMatter = body
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/gm, '')
    .replace(/<[^>]+>/g, ' ');
  const paragraph = withoutFrontMatter
    .split(/\n\s*\n/)
    .map(stripMarkdown)
    .find((value) => value.length >= 40);
  const description = paragraph || 'An archived research note from LMMs-Lab.';
  return description.length > 240 ? `${description.slice(0, 237).trim()}…` : description;
}

function outputFrontMatter(meta, body) {
  const title = String(meta.title || '').trim();
  const date = String(meta.publishDate || meta.date || '').slice(0, 10);
  const description = String(meta.description || inferDescription(body)).trim();

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !description) {
    throw new Error(`Cannot normalize metadata for legacy post: ${title || '<untitled>'}`);
  }

  const authors = Array.isArray(meta.authors)
    ? meta.authors
        .map((entry) => {
          const author = typeof entry === 'string' ? { name: entry } : entry;
          if (!author?.name) return '';
          const lines = [`  - name: ${JSON.stringify(String(author.name))}`];
          const url = author.url || LEGACY_AUTHOR_URLS.get(author.name);
          if (url) lines.push(`    url: ${JSON.stringify(String(url))}`);
          if (author.main === true) lines.push('    main: true');
          return lines.join('\n');
        })
        .filter(Boolean)
    : [];
  const tags = [...new Set([...(meta.mainTags || []), ...(meta.tags || [])])]
    .map((tag) => String(tag).trim())
    .filter(Boolean);

  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `description: ${JSON.stringify(description)}`,
    ...(authors.length ? ['authors:', ...authors] : []),
    ...(tags.length ? ['tags:', ...tags.map((tag) => `  - ${JSON.stringify(tag)}`)] : []),
    ...(meta.layout === 'showcase' ? ['layout: showcase'] : []),
    '---',
    '',
  ].join('\n');
}

function attribute(source, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`).exec(source);
  return match?.[1]?.trim() || '';
}

function expressionAttribute(source, name) {
  const startMatch = new RegExp(`\\b${name}\\s*=\\s*\\{`).exec(source);
  if (!startMatch) return undefined;

  const openingBrace = startMatch.index + startMatch[0].lastIndexOf('{');
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{') depth += 1;
    if (character !== '}') continue;
    depth -= 1;
    if (depth === 0) {
      const expression = source.slice(openingBrace + 1, index);
      return Function(`"use strict"; return (${expression});`)();
    }
  }

  return undefined;
}

function outputAssetPath(legacyRelative, postDir) {
  const safeRelative = legacyRelative
    .split(/[\\/]+/)
    .filter((part) => part && part !== '..')
    .join('/');
  const extension = extname(safeRelative).toLowerCase();
  const outputExtension = extension === '.gif' ? '.webm' : '.avif';
  const targetRelative = `legacy/${safeRelative.slice(0, -extension.length)}${outputExtension}`;
  return {
    absolute: join(postDir, targetRelative),
    relative: `./${targetRelative}`,
    extension,
  };
}

function resolveLegacyAsset(source, sourceDir) {
  if (source.startsWith('/')) {
    return join(LEGACY_ROOT, 'public', source.replace(/^\/+/, ''));
  }
  return resolve(sourceDir, source);
}

function materializeAsset(source, sourceDir, postDir) {
  if (/^(?:https?:)?\/\//i.test(source) || source.startsWith('data:')) {
    return { kind: 'image', source };
  }
  if (source.startsWith('./legacy/')) {
    return { kind: source.endsWith('.webm') ? 'video' : 'image', source };
  }

  const legacyAsset = resolveLegacyAsset(source, sourceDir);
  if (!existsSync(legacyAsset)) {
    warnings.push(`Missing legacy asset: ${legacyAsset}`);
    return { kind: 'image', source };
  }

  const legacyRelative = source.startsWith('/')
    ? source.replace(/^\/+/, '')
    : relative(LEGACY_ROOT, legacyAsset);
  const target = outputAssetPath(legacyRelative, postDir);
  mkdirSync(dirname(target.absolute), { recursive: true });

  if (!existsSync(target.absolute) || statSync(target.absolute).size === 0) {
    if (target.extension === '.gif') {
      execFileSync(
        'ffmpeg',
        [
          '-loglevel',
          'error',
          '-y',
          '-i',
          legacyAsset,
          '-an',
          '-vf',
          'scale=trunc(iw/2)*2:trunc(ih/2)*2',
          '-c:v',
          'libvpx-vp9',
          '-crf',
          '34',
          '-b:v',
          '0',
          '-pix_fmt',
          'yuv420p',
          target.absolute,
        ],
        { stdio: 'ignore' },
      );
    } else {
      execFileSync(
        'convert',
        [
          legacyAsset,
          '-auto-orient',
          '-resize',
          '2400x2400>',
          '-strip',
          '-quality',
          '72',
          '-define',
          'heic:speed=8',
          target.absolute,
        ],
        { stdio: 'ignore' },
      );
    }
  }

  return {
    kind: target.extension === '.gif' ? 'video' : 'image',
    source: target.relative,
  };
}

function renderMedia(media, alt, caption = '') {
  const escapedAlt = escapeHtml(alt || caption || 'Research figure');
  const escapedSource = escapeHtml(media.source);
  const content =
    media.kind === 'video'
      ? `<video controls autoplay loop muted playsinline preload="metadata" aria-label="${escapedAlt}">\n  <source src="${escapedSource}" type="video/webm">\n</video>`
      : `<img src="${escapedSource}" alt="${escapedAlt}" loading="lazy" decoding="async">`;

  if (!caption) {
    return content;
  }

  return `<figure>\n${content}\n<figcaption>${escapeHtml(caption)}</figcaption>\n</figure>`;
}

function mediaKey(block) {
  return /\b(?:alt|aria-label)=["']([^"']+)["']/.exec(block)?.[1] || '';
}

function preserveMaterializedMedia(existingBody, generatedBody) {
  const media = new Map();
  for (const match of existingBody.matchAll(/<img\b[^>]*>|<video\b[^>]*>[\s\S]*?<\/video>/g)) {
    const key = mediaKey(match[0]);
    if (key) media.set(key, match[0]);
  }

  return generatedBody.replace(
    /<img\b[^>]*>|<video\b[^>]*>[\s\S]*?<\/video>/g,
    (block) => media.get(mediaKey(block)) || block,
  );
}

const RESOURCE_LABELS = {
  github: 'Code',
  paper: 'Paper',
  model: 'Model',
  dataset: 'Data',
  demo: 'Demo',
  link: 'Link',
};

function renderResourceLink(resource) {
  if (!resource?.title || !resource?.url) return '';
  const type = String(resource.type || 'link').toLowerCase();
  const label = RESOURCE_LABELS[type] || 'Link';
  return `<a class="research-resource-link" data-resource-type="${escapeHtml(type)}" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[${escapeHtml(label)}]</span>
  <span class="research-resource-name">${escapeHtml(resource.title)}</span>${
    resource.metadata
      ? `\n  <span class="research-resource-metadata">${escapeHtml(resource.metadata)}</span>`
      : ''
  }${
    resource.description
      ? `\n  <span class="research-resource-description">${escapeHtml(resource.description)}</span>`
      : ''
  }
</a>`;
}

function renderResourceCard(attributes) {
  const title = attribute(attributes, 'title') || 'Resources';
  const description = attribute(attributes, 'description');
  const resources = expressionAttribute(attributes, 'resources') || [];
  const groups = expressionAttribute(attributes, 'groups') || [];
  const resourceLinks = resources.map(renderResourceLink).filter(Boolean).join('\n');
  const renderedGroups = groups
    .map((group) => {
      const type = String(group.type || 'link').toLowerCase();
      const label = RESOURCE_LABELS[type] || 'Link';
      const items = (group.items || [])
        .map((item) => renderResourceLink({ ...item, title: item.name, type }))
        .filter(Boolean)
        .join('\n');
      return `<section class="research-resource-group">
  <h4><span>[${escapeHtml(label)}]</span> ${escapeHtml(group.title || label)}</h4>${
    group.description
      ? `\n  <p class="research-resource-group-description">${escapeHtml(group.description)}</p>`
      : ''
  }
  <section class="research-resource-links">${items}</section>
</section>`;
    })
    .join('\n');

  return `<section class="research-resource-card">
  <header class="research-resource-header">
    <p class="research-block-kicker">Open research</p>
    <h3>${escapeHtml(title)}</h3>${description ? `\n    <p>${escapeHtml(description)}</p>` : ''}
  </header>${resourceLinks ? `\n  <section class="research-resource-links">${resourceLinks}</section>` : ''}${
    renderedGroups
      ? `\n  <section class="research-resource-groups">${renderedGroups}</section>`
      : ''
  }
</section>`;
}

function renderRlDonutCharts(caption) {
  const charts = [
    {
      title: 'LLaVA-OneVision-1.5 RL Data',
      total: '67.0K',
      slices: [
        ['STEM', 58],
        ['Grounding', 22.4],
        ['Spatial', 6.3],
        ['Coding', 6],
        ['Counting', 4.2],
        ['OCR & Diagram', 2.3],
      ],
    },
    {
      title: 'Stage 1 · Answer-only',
      total: '19.9K',
      slices: [
        ['Grounding', 75],
        ['OCR & Diagram', 10.9],
        ['Counting', 14.1],
      ],
    },
    {
      title: 'Stage 2 · Chain-of-Thought',
      total: '49.2K',
      slices: [
        ['STEM', 79],
        ['OCR & Diagram', 0.8],
        ['Counting', 0.6],
        ['Coding', 8.1],
        ['Spatial', 8.5],
        ['Grounding', 3],
      ],
    },
  ];
  const colors = ['peach', 'sapphire', 'mauve', 'green', 'pink', 'yellow'];

  const rendered = charts
    .map((chart, chartIndex) => {
      let cursor = 0;
      const stops = chart.slices.map(([, value], index) => {
        const start = cursor;
        cursor += value;
        return `var(--ctp-${colors[index]}) ${start}% ${cursor}%`;
      });
      const legend = chart.slices
        .map(
          ([label, value], index) =>
            `<li><span style="--legend-color: var(--ctp-${colors[index]})"></span>${escapeHtml(label)} <b>${value}%</b></li>`,
        )
        .join('');
      return `<section class="rl-donut-chart">
  <span class="rl-donut" style="--donut-fill: ${stops.join(', ')}" role="img" aria-label="${escapeHtml(chart.title)}, total ${chart.total}">
    <span><b>${chart.total}</b><small>Total</small></span>
  </span>
  <h4>${escapeHtml(chart.title)}</h4>
  <ul>${legend}</ul>
  <span class="rl-chart-letter">(${String.fromCharCode(97 + chartIndex)})</span>
</section>`;
    })
    .join('\n');

  return `<figure class="rl-distribution-figure">
  <section class="rl-donut-grid">${rendered}</section>
  <figcaption>${escapeHtml(caption || 'Distribution of task categories in the RL training data.')}</figcaption>
</figure>`;
}

function dedentBlock(source) {
  const lines = source.replace(/^\s*\n|\n\s*$/g, '').split(/\r?\n/);
  const indentation = lines
    .filter((line) => line.trim())
    .map((line) => /^\s*/.exec(line)?.[0].length ?? 0);
  const minimum = indentation.length ? Math.min(...indentation) : 0;
  return lines.map((line) => line.slice(minimum)).join('\n');
}

function transformBody(body, sourceDir, postDir, meta) {
  let transformed = body;

  transformed = transformed.replace(
    /^import[\s\S]*?from\s+["']@\/components\/mdx(?:\/components)?["'];\s*/gm,
    '',
  );

  // MDX parses Markdown inside JSX divs, while CommonMark treats a div as one
  // raw HTML block. Unwrap the two table-scroller layers and remove their
  // inherited indentation before Marked sees them.
  transformed = transformed.replace(
    /<div\s+class=["']overflow-x-auto["']>\s*<div\s+class=["']min-w-fit["']>([\s\S]*?)<\/div>\s*<\/div>/g,
    (_, content) => `\n\n<section class="table-wrapper">\n${dedentBlock(content)}\n</section>\n\n`,
  );

  // Preserve the only legacy div whose visual grouping is meaningful and
  // whose children are already native HTML. Using a paragraph keeps the badge
  // row valid after the remaining presentation-only divs are unwrapped.
  transformed = transformed.replace(
    /<div\b[^>]*style=["'][^"']*text-align:\s*center[^"']*margin:\s*2rem\s+0[^"']*["'][^>]*>([\s\S]*?)<\/div>/g,
    (_, content) => `\n\n<p class="legacy-badge-row">\n${dedentBlock(content)}\n</p>\n\n`,
  );

  transformed = transformed.replace(/<ResponsiveImage\b([\s\S]*?)\/>/g, (_, attributes) => {
    const source = attribute(attributes, 'src');
    const alt = attribute(attributes, 'alt');
    const caption = attribute(attributes, 'caption');
    if (!source) return '';
    return `\n\n${renderMedia(materializeAsset(source, sourceDir, postDir), alt, caption)}\n\n`;
  });

  transformed = transformed.replace(
    /<ResourceCard\b([\s\S]*?)\/>/g,
    (_, attributes) => `\n\n${renderResourceCard(attributes)}\n\n`,
  );

  transformed = transformed.replace(
    /<CodeDemo\b([^>]*)>([\s\S]*?)<\/CodeDemo>/g,
    (_, attributes, content) => {
      const title = attribute(attributes, 'title');
      const showCopy = !/\bshowCopy\s*=\s*\{false\}/.test(attributes);
      if (!title && showCopy) return `\n\n${content.trim()}\n\n`;
      const nextContent = content.replace(/```([^\r\n]*)/, (fence, info) => {
        const language = info.trim() || (!title && !showCopy ? 'text' : '');
        const metadata = [
          language,
          title ? `title=${JSON.stringify(title)}` : '',
          !showCopy ? 'copy=false' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return `\`\`\`${metadata}`;
      });
      return `\n\n${nextContent.trim()}\n\n`;
    },
  );

  transformed = transformed.replace(
    /<Collapsible\b([^>]*)>([\s\S]*?)<\/Collapsible>/g,
    (_, attributes, content) => {
      const summary = attribute(attributes, 'summary') || 'Details';
      const paragraphs = content
        .trim()
        .split(/\n\s*\n/)
        .map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\s+/g, ' ').trim())}</p>`)
        .join('\n');
      return `\n\n<details class="research-collapsible">\n<summary>${escapeHtml(summary)}</summary>\n${paragraphs}\n</details>\n\n`;
    },
  );

  transformed = transformed.replace(/<RLDonutCharts\b([\s\S]*?)\/>/g, (_, attributes) => {
    const caption = attribute(attributes, 'caption');
    return `\n\n${renderRlDonutCharts(caption)}\n\n`;
  });

  transformed = transformed.replace(
    /<iframe\b[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/g,
    (_, source) => `\n\n[Watch the embedded media](${source})\n\n`,
  );

  transformed = transformed.replace(/<img\b([^>]*?)\/?\s*>/g, (_, attributes) => {
    const source = attribute(attributes, 'src');
    const alt = attribute(attributes, 'alt');
    if (!source) return '';
    return renderMedia(materializeAsset(source, sourceDir, postDir), alt);
  });

  transformed = transformed.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
    (_, alt, source) => {
      const media = materializeAsset(source, sourceDir, postDir);
      return media.kind === 'video' ? renderMedia(media, alt) : `![${alt}](${media.source})`;
    },
  );

  transformed = transformed
    .replace(/<\/?div\b[^>]*>/g, '\n')
    .replace(/\bclassName=/g, 'class=')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

  const unsupported = transformed.match(/<\/?[A-Z][A-Za-z0-9]*/);
  if (unsupported) {
    throw new Error(`Unsupported MDX component remains: ${unsupported[0]}`);
  }

  const appendix = [];
  if (meta.acknowledgement) {
    appendix.push(`## Acknowledgements\n\n${meta.acknowledgement}`);
  }
  if (meta.bibtex && !/^##\s+BibTeX/im.test(transformed)) {
    appendix.push(`## BibTeX\n\n\`\`\`bibtex\n${String(meta.bibtex).trim()}\n\`\`\``);
  }

  return `${transformed}${appendix.length ? `\n\n${appendix.join('\n\n')}` : ''}\n`;
}

function llavaOneVisionTwoBody(postDir, meta) {
  const roadmap = materializeAsset('/posts/llava_onevision_2/roadmap.png', LEGACY_ROOT, postDir);
  const architecture = materializeAsset('/posts/llava_onevision_2/arch.png', LEGACY_ROOT, postDir);

  return `[Code](https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2) · [Models](https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct) · [Training data](https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data) · [Online demo](https://huggingface.co/collections/mvp-lab/llava-onevision-2)

## Overview

LLaVA-OneVision-2 is a fully open recipe for training competitive 8B-class
vision-language models. Every stage, dataset, checkpoint, and evaluation path
is released for reproducibility.

The release focuses on three capabilities:

1. **Long-video understanding.** A four-stage curriculum extends video
   comprehension from 30-second clips to 15-minute footage.
2. **Codec-based input.** Dense codec-selected evidence preserves motion-rich
   temporal information that uniform frame sampling can miss.
3. **A fully open pipeline.** Code, training data, evaluation tools, and model
   checkpoints are published without gated artifacts.

<video controls loop muted playsinline preload="metadata" aria-label="Uniform frames and codec-selected evidence on a jump-rope video">
  <source src="https://cdn.jsdelivr.net/gh/anxiangsir/ov2_asset@main/demo/codec/codec-frame-jumprope-sample-01.webm" type="video/webm">
</video>

*The same jump-rope clip rendered with uniform frames and codec-selected temporal evidence.*

## Roadmap

${renderMedia(roadmap, 'LLaVA-OneVision-2 roadmap', 'Evolution from frame sampling and token compression to codec-aligned perceptual intelligence.')}

## Video Caption Dataset

The length-stratified video-caption corpus spans 30 seconds to 15 minutes and
contains roughly 8 million captioned clips, 95.1 billion image tokens, and 9.9
billion caption tokens.

| Bucket | Samples | Storage | Image tokens | Caption tokens |
| --- | ---: | ---: | ---: | ---: |
| 30s caption | 4.2M | 29 TB | 24.7B | 3.0B |
| 30–60s caption | 2.7M | 32 TB | 31.8B | 2.3B |
| 60–180s caption | 700K | 13 TB | 12.3B | 0.7B |
| 10–15min caption | 350K | 65 TB | 26.3B | 4.0B |
| **Total** | **~8M** | **~139 TB** | **95.1B** | **9.9B** |

## Training Pipeline

### Stage 1 — Video Bootstrap

Bootstrap from LLaVA-OneVision-1.5 with 85M concept-balanced image-text pairs
and 4.2M short video captions.

### Stage 2 — Instruction Tuning

Combine large-scale multimodal instruction data with captions covering
30-second to 3-minute clips.

### Stage 3 — Long-Video Understanding

Add established video-instruction corpora and 350K captions for 10–15 minute
videos at 384 frames.

### Stage 4 — Codec, Spatial, and Tracking Supervision

Adopt the improved codec, densify long-video sampling to 768 frames, and add
spatial understanding plus video tracking supervision.

## Visual Encoder

${renderMedia(architecture, 'OneVision-Encoder architecture overview', 'OneVision-Encoder pretraining for high-density documents and frame-rich video.')}

## Open-Source Resources

- [Training code and evaluation harness](https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2)
- [LLaVA-OneVision-2-8B-Instruct checkpoint](https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct)
- [Training dataset collection](https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data)
- [Interactive demo collection](https://huggingface.co/collections/mvp-lab/llava-onevision-2)

${meta.acknowledgement ? `## Acknowledgements\n\n${meta.acknowledgement}\n\n` : ''}## BibTeX

\`\`\`bibtex
${String(meta.bibtex || '').trim()}
\`\`\`
`;
}

function importSource(sourcePath, requestedSlug) {
  const raw = readFileSync(sourcePath, 'utf8');
  const { meta, body } = splitFrontMatter(raw, sourcePath);
  const slug = toSlug(requestedSlug || basename(sourcePath, extname(sourcePath)));
  const postDir = join(TARGET_POSTS_DIR, slug);
  const indexPath = join(postDir, 'index.md');

  if (existsSync(indexPath)) {
    if (SYNC_METADATA || SYNC_CONTENT) {
      const current = readFileSync(indexPath, 'utf8');
      const currentFrontMatter = /^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/.exec(current);
      if (!currentFrontMatter) {
        throw new Error(`Current source ${indexPath} has no YAML front matter`);
      }
      const existingBody = current.slice(currentFrontMatter[0].length);
      const currentBody = SYNC_CONTENT
        ? preserveMaterializedMedia(
            existingBody,
            slug === 'llava-onevision-2'
              ? llavaOneVisionTwoBody(postDir, meta)
              : transformBody(body, dirname(sourcePath), postDir, meta),
          )
        : existingBody.replace(/^\*\*Authors:\*\*[^\n]*\r?\n(?:\r?\n)*/, '').replace(/^\s+/, '');
      writeFileSync(indexPath, `${outputFrontMatter(meta, currentBody)}${currentBody}`, 'utf8');
      synchronized.push(slug);
      return;
    }
    resumed.push(slug);
    return;
  }

  mkdirSync(postDir, { recursive: true });
  const normalizedBody =
    slug === 'llava-onevision-2'
      ? llavaOneVisionTwoBody(postDir, meta)
      : transformBody(body, dirname(sourcePath), postDir, meta);
  writeFileSync(indexPath, `${outputFrontMatter(meta, normalizedBody)}${normalizedBody}`, 'utf8');
  imported.push(slug);
}

function importSiteImage(legacyRelative, targetRelative) {
  const source = join(LEGACY_ROOT, 'public', legacyRelative);
  const target = join(SITE_ASSETS_DIR, targetRelative);
  if (!existsSync(source)) {
    warnings.push(`Missing legacy site image: ${source}`);
    return;
  }
  if (existsSync(target) && statSync(target).size > 0) return;

  mkdirSync(dirname(target), { recursive: true });
  execFileSync(
    'convert',
    [
      source,
      '-auto-orient',
      '-resize',
      '2400x2400>',
      '-strip',
      '-quality',
      '78',
      '-define',
      'heic:speed=8',
      target,
    ],
    { stdio: 'ignore' },
  );
}

for (const entry of readdirSync(LEGACY_POSTS_DIR, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.mdx')) {
    importSource(join(LEGACY_POSTS_DIR, entry.name));
  }
}

for (const note of [
  { file: 'dllm.md', slug: 'diffusion-language-models' },
  { file: 'wake-up.md', slug: 'digital-tide' },
]) {
  const sourcePath = join(LEGACY_NOTES_DIR, note.file);
  if (existsSync(sourcePath)) {
    importSource(sourcePath, note.slug);
  }
}

for (const [source, target] of [
  ['assets/logo.png', 'lmms-lab-logo.avif'],
  ['images/blog_thumbnails/llava_onevision_2.png', 'home/llava-onevision-2.avif'],
  ['images/blog_thumbnails/onevision_encoder.png', 'home/onevision-encoder.avif'],
  ['images/blog_thumbnails/llava_ov_1_5.png', 'home/llava-onevision-1-5.avif'],
  ['images/blog_thumbnails/longvt.jpg', 'home/longvt.avif'],
  ['images/blog_thumbnails/openmmreasoner.png', 'home/openmmreasoner.avif'],
]) {
  importSiteImage(source, target);
}

console.log(`Imported ${imported.length} legacy posts: ${imported.join(', ')}`);
if (synchronized.length) {
  console.log(`Synchronized metadata for ${synchronized.length} posts: ${synchronized.join(', ')}`);
}
if (resumed.length) {
  console.log(`Kept ${resumed.length} existing imports: ${resumed.join(', ')}`);
}
for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}
