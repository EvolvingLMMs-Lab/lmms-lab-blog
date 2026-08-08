import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { Marked } from 'marked';
import { join } from 'path';
import { createHighlighter } from 'shiki';
import { blogVideoBlock, renderBlogVideos } from './lib/blog-video-renderer.mjs';
import { createCodeRenderer } from './lib/code-renderer.mjs';
import {
  htmlFragmentBlock,
  normalizeHtmlAssets,
  renderHtmlFragments,
} from './lib/html-fragment-renderer.mjs';
import { mathBlock, mathInline } from './lib/math-extensions.mjs';
import { discoverPostSources } from './lib/post-source.mjs';
import { tableRenderer } from './lib/table-renderer.mjs';
import { renderTableOfContents } from './lib/toc-renderer.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const POSTS_DIR = join(ROOT, 'content/posts');
const AUTHORING_GUIDE = join(ROOT, 'docs/authoring.md');
const DATA_DIR = join(ROOT, 'src/app/data');
const OUTPUT = join(DATA_DIR, 'posts.ts');
const AUTHORING_GUIDE_OUTPUT = join(DATA_DIR, 'authoring-docs.ts');
const SITEMAP_OUTPUT = join(ROOT, 'public/sitemap.xml');
const POST_ASSET_BASE = '/posts';
const SITE_ORIGIN = 'https://www.lmms-lab.com';
const DEFAULT_AI_IMAGE_LABEL = 'AI Summary';
const imageDimensions = new Map();

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function renderSitemap(posts) {
  const latestDate = posts[0]?.date;
  const pages = [
    { path: '/' },
    { path: '/about' },
    { path: '/blog', date: latestDate },
    { path: '/blog/docs' },
    ...posts.map((post) => ({ path: `/blog/${encodeURIComponent(post.slug)}`, date: post.date })),
  ];
  const entries = pages
    .map(
      (page) =>
        `  <url>\n    <loc>${escapeXml(new URL(page.path, SITE_ORIGIN).toString())}</loc>${
          page.date ? `\n    <lastmod>${escapeXml(page.date)}</lastmod>` : ''
        }\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

// Collect languages used across all posts for Shiki
function collectLangs(posts) {
  const langs = new Set();
  for (const md of posts) {
    for (const match of md.matchAll(/```(\w+)/g)) {
      langs.add(match[1]);
    }
  }
  return [...langs];
}

function isRootedOrRemoteHref(href) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\/)/i.test(href);
}

function normalizePostImageHref(href, slug) {
  if (isRootedOrRemoteHref(href)) {
    return href;
  }

  const localHref = href.replace(/^\.\//, '');
  if (localHref.startsWith(`${slug}/`)) {
    return `${POST_ASSET_BASE}/${localHref}`;
  }

  return `${POST_ASSET_BASE}/${slug}/${localHref}`;
}

function resolvePostAssetPath(href, slug) {
  if (isRootedOrRemoteHref(href)) {
    return null;
  }

  const localHref = href.replace(/^\.\//, '');
  if (localHref.startsWith(`${slug}/`)) {
    return join(POSTS_DIR, localHref);
  }

  return join(POSTS_DIR, slug, localHref);
}

function getImageDimensionsForFile(file) {
  if (!file || !existsSync(file)) {
    return null;
  }

  if (imageDimensions.has(file)) {
    return imageDimensions.get(file);
  }

  for (const [command, args] of [
    ['magick', ['identify', '-format', '%w %h', file]],
    ['identify', ['-format', '%w %h', file]],
  ]) {
    try {
      const output = execFileSync(command, args, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      const [width, height] = output.split(/\s+/).map(Number);
      if (Number.isFinite(width) && Number.isFinite(height)) {
        const dimensions = { width, height };
        imageDimensions.set(file, dimensions);
        return dimensions;
      }
    } catch {
      // Try the next ImageMagick executable name.
    }
  }

  imageDimensions.set(file, null);
  return null;
}

function getImageDimensions(href, slug) {
  return getImageDimensionsForFile(resolvePostAssetPath(href, slug));
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
}

function renderCustomElements(html, slug) {
  const dom = new JSDOM(`<body>${html}</body>`);
  const { document } = dom.window;
  let aiImageCount = 0;

  for (const node of Array.from(document.querySelectorAll('ai-img'))) {
    const rawHref = node.getAttribute('src') || node.textContent || '';
    const href = rawHref.trim();

    if (!href) {
      node.remove();
      continue;
    }

    const label = node.getAttribute('label')?.trim() || DEFAULT_AI_IMAGE_LABEL;
    const src = normalizePostImageHref(href, slug);
    const targetId = `ai-summary-${slug}-${aiImageCount}`;
    aiImageCount += 1;

    const button = document.createElement('button');
    button.className = 'ai-summary-button';
    button.type = 'button';
    button.title = node.getAttribute('title')?.trim() || `Show ${label}`;
    button.setAttribute('aria-label', `${label}: ${href}`);
    button.setAttribute('aria-controls', targetId);
    button.setAttribute('aria-expanded', 'false');

    const icon = document.createElement('i');
    icon.className = 'ph ph-magic-wand';
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = label;

    button.append(icon, text);

    const figure = document.createElement('figure');
    figure.className = 'ai-summary-figure';
    figure.id = targetId;
    figure.hidden = true;

    const image = document.createElement('img');
    image.className = 'ai-summary-image';
    image.src = src;
    image.alt = node.getAttribute('alt')?.trim() || label;
    const dimensions = getImageDimensions(href, slug);
    const width = node.getAttribute('width')?.trim() || dimensions?.width;
    const height = node.getAttribute('height')?.trim() || dimensions?.height;
    if (width && height) {
      image.setAttribute('width', String(width));
      image.setAttribute('height', String(height));
    }
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    image.setAttribute('data-zoom-src', src);

    figure.append(image);

    const target = node.closest('h1,h2,h3,h4,h5,h6') || node.parentElement;
    node.replaceWith(button);

    if (target) {
      insertAfter(target, figure);
    } else {
      button.after(figure);
    }
  }

  renderBlogVideos(document);
  renderHtmlFragments(document, {
    postsDir: POSTS_DIR,
    slug,
    getImageDimensions: getImageDimensionsForFile,
  });
  normalizeHtmlAssets(document, {
    baseDir: join(POSTS_DIR, slug),
    postDir: join(POSTS_DIR, slug),
    slug,
    getImageDimensions: getImageDimensionsForFile,
  });

  return document.body.innerHTML;
}

function renderMarkdown(md, slug, highlighter) {
  // Custom image renderer: publishes post-local assets from content/posts/<slug>.
  const imageRenderer = (token) => {
    const src = normalizePostImageHref(token.href, slug);
    const alt = token.text || '';
    const title = token.title ? ` title="${escapeAttribute(token.title)}"` : '';
    const dimensions = getImageDimensions(token.href, slug);
    const sizeAttrs = dimensions
      ? ` width="${dimensions.width}" height="${dimensions.height}"`
      : '';
    return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${title}${sizeAttrs} loading="lazy" decoding="async" data-zoom-src="${escapeAttribute(src)}">`;
  };

  const renderer = new Marked({
    extensions: [blogVideoBlock, htmlFragmentBlock, mathBlock, mathInline],
    renderer: {
      code: createCodeRenderer(highlighter),
      table: tableRenderer,
      image: imageRenderer,
    },
  });

  const html = renderer.parse(md, { async: false });
  return renderCustomElements(html, slug);
}

function renderHtml(html, slug) {
  return renderCustomElements(html, slug);
}

function renderAuthoringGuide(markdown, highlighter) {
  const renderer = new Marked({
    extensions: [mathBlock, mathInline],
    renderer: {
      code: createCodeRenderer(highlighter),
      table: tableRenderer,
    },
  });

  return renderer.parse(markdown, { async: false });
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const rawPosts = discoverPostSources(POSTS_DIR);

  const authoringGuide = readFileSync(AUTHORING_GUIDE, 'utf-8');

  // Create Shiki highlighter with all languages needed by posts and the online guide.
  const langs = collectLangs([...rawPosts.map((post) => post.source), authoringGuide]);
  const highlighter = await createHighlighter({
    themes: ['catppuccin-latte'],
    langs: langs.length ? langs : ['text'],
  });

  const posts = rawPosts.map(({ slug, meta, format, source }) => {
    const renderedHtml =
      format === 'html' ? renderHtml(source, slug) : renderMarkdown(source, slug, highlighter);
    const rendered = renderTableOfContents(renderedHtml, `/blog/${encodeURIComponent(slug)}`);
    return { slug, ...meta, contentHtml: rendered.html, toc: rendered.toc };
  });

  posts.sort((a, b) => b.date.localeCompare(a.date));

  const output = `// Auto-generated by scripts/build-posts.mjs — do not edit manually
import { Post } from '../models/post.model';

export const POSTS: Post[] = ${JSON.stringify(posts, null, 2)};
`;

  writeFileSync(OUTPUT, output, 'utf-8');
  const renderedGuide = renderTableOfContents(
    renderAuthoringGuide(authoringGuide, highlighter),
    '/blog/docs',
  );
  const authoringGuideOutput = `// Auto-generated by scripts/build-posts.mjs — do not edit manually
import { TocItem } from '../models/post.model';

export const AUTHORING_DOCS_HTML = ${JSON.stringify(renderedGuide.html)};
export const AUTHORING_DOCS_TOC: TocItem[] = ${JSON.stringify(renderedGuide.toc, null, 2)};
`;
  writeFileSync(AUTHORING_GUIDE_OUTPUT, authoringGuideOutput, 'utf-8');
  writeFileSync(SITEMAP_OUTPUT, renderSitemap(posts), 'utf-8');
  console.log(`Generated ${posts.length} posts → src/app/data/posts.ts`);
  console.log('Generated authoring guide → src/app/data/authoring-docs.ts');
  console.log('Generated sitemap → public/sitemap.xml');
}

main();
