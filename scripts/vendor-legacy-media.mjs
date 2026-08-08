import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const POSTS_DIR = join(PROJECT_ROOT, 'content/posts');
const SKIPPED_HOSTS = new Set(['img.shields.io']);
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'lmms-legacy-media-'));
const imported = [];
const warnings = [];

function sourceUrl(url) {
  const parsed = new URL(url);
  if (parsed.hostname !== 'camo.githubusercontent.com') return url;

  const encoded = parsed.pathname.split('/').at(-1);
  if (!encoded || !/^(?:[a-f\d]{2})+$/i.test(encoded)) return url;
  const decoded = Buffer.from(encoded, 'hex').toString('utf8');
  return /^https?:\/\//i.test(decoded) ? decoded : url;
}

function safeBaseName(url) {
  const parsed = new URL(url);
  const sourceName = basename(decodeURIComponent(parsed.pathname)) || 'media';
  const withoutExtension = sourceName.slice(0, sourceName.length - extname(sourceName).length);
  const normalized = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 8);
  return `${normalized || 'media'}-${hash}`;
}

function download(url, destination) {
  execFileSync(
    'wget',
    [
      '-4',
      '--quiet',
      '--timeout=25',
      '--tries=2',
      '--user-agent',
      'Mozilla/5.0 LMMs-Lab legacy media migration',
      '--output-document',
      destination,
      sourceUrl(url),
    ],
    { stdio: 'inherit' },
  );
}

function vendorMedia(url, postDirectory) {
  const parsed = new URL(url);
  if (SKIPPED_HOSTS.has(parsed.hostname)) return null;

  const mediaDirectory = join(postDirectory, 'remote-media');
  const baseName = safeBaseName(url);
  const avifTarget = join(mediaDirectory, `${baseName}.avif`);
  const webmTarget = join(mediaDirectory, `${baseName}.webm`);
  if (existsSync(avifTarget)) return { kind: 'image', source: `./remote-media/${baseName}.avif` };
  if (existsSync(webmTarget)) return { kind: 'video', source: `./remote-media/${baseName}.webm` };

  const downloaded = join(temporaryDirectory, `${baseName}.source`);
  download(url, downloaded);
  const format = execFileSync('identify', ['-format', '%m', `${downloaded}[0]`], {
    encoding: 'utf8',
  })
    .trim()
    .toUpperCase();
  mkdirSync(mediaDirectory, { recursive: true });

  if (format === 'GIF') {
    execFileSync(
      'ffmpeg',
      [
        '-loglevel',
        'error',
        '-y',
        '-i',
        downloaded,
        '-an',
        '-vf',
        'scale=min(1600\\,iw):trunc(ow/a/2)*2',
        '-c:v',
        'libvpx-vp9',
        '-crf',
        '34',
        '-b:v',
        '0',
        '-pix_fmt',
        'yuv420p',
        webmTarget,
      ],
      { stdio: 'ignore' },
    );
    imported.push(webmTarget);
    return { kind: 'video', source: `./remote-media/${baseName}.webm` };
  }

  execFileSync(
    'convert',
    [
      downloaded,
      '-auto-orient',
      '-resize',
      '2400x2400>',
      '-strip',
      '-quality',
      '72',
      '-define',
      'heic:speed=8',
      avifTarget,
    ],
    { stdio: 'ignore' },
  );
  imported.push(avifTarget);
  return { kind: 'image', source: `./remote-media/${baseName}.avif` };
}

function renderVideo(source, alt) {
  const label = String(alt || 'Animated research figure')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<video autoplay loop muted playsinline preload="metadata" aria-label="${label}">\n  <source src="${source}" type="video/webm">\n</video>`;
}

function processPost(postDirectory) {
  const indexPath = join(postDirectory, 'index.md');
  if (!existsSync(indexPath)) return;

  let source = readFileSync(indexPath, 'utf8');
  let changed = false;

  source = source.replace(/<img\b[^>]*>/gi, (image) => {
    const sourceMatch = /\bsrc=["'](https?:\/\/[^"']+)["']/i.exec(image);
    if (!sourceMatch) return image;
    const alt = /\balt=["']([^"']*)["']/i.exec(image)?.[1] ?? '';

    try {
      const local = vendorMedia(sourceMatch[1], postDirectory);
      if (!local) return image;
      changed = true;
      return local.kind === 'video'
        ? renderVideo(local.source, alt)
        : image.replace(sourceMatch[1], local.source);
    } catch (error) {
      warnings.push(`${sourceMatch[1]}: ${error.message}`);
      return image;
    }
  });

  source = source.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
    (image, alt, url) => {
      try {
        const local = vendorMedia(url, postDirectory);
        if (!local) return image;
        changed = true;
        return local.kind === 'video'
          ? renderVideo(local.source, alt)
          : `![${alt}](${local.source})`;
      } catch (error) {
        warnings.push(`${url}: ${error.message}`);
        return image;
      }
    },
  );

  if (changed) writeFileSync(indexPath, source, 'utf8');
}

try {
  for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) processPost(join(POSTS_DIR, entry.name));
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Vendored ${imported.length} remote legacy media files.`);
for (const warning of warnings) console.warn(`Warning: ${warning}`);
