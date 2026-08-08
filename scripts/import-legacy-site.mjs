import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const TARGET_POSTS_DIR = join(PROJECT_ROOT, 'content/posts');
const LEGACY_ROOT = resolve(process.argv[2] || '');
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

  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
  ].join('\n');
}

function attribute(source, name) {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`).exec(source);
  return match?.[1]?.trim() || '';
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

function renderResourceCard(attributes) {
  const resourcesIndex = attributes.search(/\bresources\s*=/);
  const cardAttributes = resourcesIndex >= 0 ? attributes.slice(0, resourcesIndex) : attributes;
  const resourcesSource = resourcesIndex >= 0 ? attributes.slice(resourcesIndex) : '';
  const title = attribute(cardAttributes, 'title') || 'Resources';
  const description = attribute(cardAttributes, 'description');
  const links = [];
  const linkPattern = /title\s*:\s*["']([^"']+)["'][\s\S]*?url\s*:\s*["']([^"']+)["']/g;

  for (const match of resourcesSource.matchAll(linkPattern)) {
    links.push(`- [${match[1]}](${match[2]})`);
  }

  return [`### ${title}`, description, links.length ? links.join('\n') : '']
    .filter(Boolean)
    .join('\n\n');
}

function renderAuthors(meta) {
  if (!Array.isArray(meta.authors) || meta.authors.length === 0) {
    return '';
  }

  const authors = meta.authors.map((entry) => {
    const name = typeof entry === 'string' ? entry : entry?.name;
    const url = entry?.url || LEGACY_AUTHOR_URLS.get(name);
    return url ? `[${name}](${url})` : name;
  });
  return `**Authors:** ${authors.join(' · ')}\n\n`;
}

function transformBody(body, sourceDir, postDir, meta) {
  let transformed = body;

  transformed = transformed.replace(
    /^import[\s\S]*?from\s+["']@\/components\/mdx(?:\/components)?["'];\s*/gm,
    '',
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

  transformed = transformed.replace(/<CodeDemo\b([^>]*)>/g, (_, attributes) => {
    const title = attribute(attributes, 'title');
    return title ? `\n\n**${title}**\n\n` : '\n\n';
  });
  transformed = transformed.replace(/<\/CodeDemo>/g, '\n\n');

  transformed = transformed.replace(/<Collapsible\b([^>]*)>/g, (_, attributes) => {
    const summary = attribute(attributes, 'summary') || 'Details';
    return `\n\n#### ${summary}\n\n`;
  });
  transformed = transformed.replace(/<\/Collapsible>/g, '\n\n');

  transformed = transformed.replace(/<RLDonutCharts\b([\s\S]*?)\/>/g, (_, attributes) => {
    const caption = attribute(attributes, 'caption');
    return `\n\n> ${caption || 'Distribution of task categories in the RL training data.'}\n\n`;
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

  return `${renderAuthors(meta)}${transformed}${appendix.length ? `\n\n${appendix.join('\n\n')}` : ''}\n`;
}

function llavaOneVisionTwoBody(postDir, meta) {
  const roadmap = materializeAsset('/posts/llava_onevision_2/roadmap.png', LEGACY_ROOT, postDir);
  const architecture = materializeAsset('/posts/llava_onevision_2/arch.png', LEGACY_ROOT, postDir);

  return `${renderAuthors(meta)}[Code](https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2) · [Models](https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct) · [Training data](https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data) · [Online demo](https://huggingface.co/collections/mvp-lab/llava-onevision-2)

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
if (resumed.length) {
  console.log(`Kept ${resumed.length} existing imports: ${resumed.join(', ')}`);
}
for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}
