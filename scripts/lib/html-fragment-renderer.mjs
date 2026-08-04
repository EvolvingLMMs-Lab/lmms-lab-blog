import { existsSync, readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'path';

const ROOTED_OR_REMOTE = /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\/)/i;

export const htmlFragmentBlock = {
  name: 'htmlFragmentBlock',
  level: 'block',
  start(source) {
    return source.match(/<html-fragment\b/i)?.index;
  },
  tokenizer(source) {
    const match = source.match(/^<html-fragment\b[\s\S]*?<\/html-fragment>[ \t]*(?:\n|$)/i);
    if (!match) {
      return undefined;
    }
    return {
      type: 'htmlFragmentBlock',
      raw: match[0],
    };
  },
  renderer(token) {
    return `${token.raw}\n`;
  },
};

function assertInside(root, candidate, label) {
  const relativePath = relative(root, candidate);
  if (relativePath.startsWith(`..${sep}`) || relativePath === '..' || isAbsolute(relativePath)) {
    throw new Error(`${label} escapes the post asset directory`);
  }
}

function toPublishedAssetHref(postDir, candidate, slug) {
  const assetPath = relative(postDir, candidate).split(sep).join('/');
  return `/posts/${slug}${assetPath ? `/${assetPath}` : ''}`;
}

function resolveLocalReference(rawHref, { baseDir, postDir, slug }) {
  const href = rawHref.trim();
  if (!href || ROOTED_OR_REMOTE.test(href)) {
    return { href, file: null };
  }

  const file = resolve(baseDir, href);
  assertInside(postDir, file, `HTML asset "${href}"`);
  return {
    href: toPublishedAssetHref(postDir, file, slug),
    file,
  };
}

function inlineLocalStylesheets(document, { baseDir, postDir }) {
  for (const link of Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))) {
    const rawHref = link.getAttribute('href')?.trim() ?? '';
    if (!rawHref || ROOTED_OR_REMOTE.test(rawHref)) {
      continue;
    }

    const stylesheetPath = resolve(baseDir, rawHref);
    assertInside(postDir, stylesheetPath, `HTML stylesheet "${rawHref}"`);
    if (extname(stylesheetPath).toLowerCase() !== '.css') {
      throw new Error(`HTML stylesheet must reference a .css file: ${rawHref}`);
    }

    const style = document.createElement('style');
    style.dataset['htmlStylesheet'] = rawHref;
    style.textContent = readFileSync(stylesheetPath, 'utf-8');
    link.replaceWith(style);
  }
}

export function normalizeHtmlAssets(
  document,
  { baseDir, postDir, slug, getImageDimensions = () => null },
) {
  if (document.querySelector('iframe')) {
    throw new Error('Native HTML content cannot contain iframes');
  }
  if (document.querySelector('script')) {
    throw new Error(
      'Native HTML content cannot contain script tags; use data-blog-controller with a local module',
    );
  }

  const assetAttributes = [
    ['img[src]', 'src'],
    ['video[src]', 'src'],
    ['video[poster]', 'poster'],
    ['source[src]', 'src'],
    ['audio[src]', 'src'],
    ['track[src]', 'src'],
    ['link[href]', 'href'],
    ['a[href]', 'href'],
  ];

  for (const [selector, attribute] of assetAttributes) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      const rawHref = element.getAttribute(attribute) ?? '';
      const resolved = resolveLocalReference(rawHref, { baseDir, postDir, slug });
      if (resolved.href) {
        element.setAttribute(attribute, resolved.href);
      }

      if (element.tagName === 'IMG') {
        const dimensions = resolved.file ? getImageDimensions(resolved.file) : null;
        if (dimensions && !element.hasAttribute('width') && !element.hasAttribute('height')) {
          element.setAttribute('width', String(dimensions.width));
          element.setAttribute('height', String(dimensions.height));
        }
        element.setAttribute('loading', element.getAttribute('loading') || 'lazy');
        element.setAttribute('decoding', element.getAttribute('decoding') || 'async');
        element.setAttribute('data-zoom-src', resolved.href);
      }
    }
  }

  for (const controller of Array.from(document.querySelectorAll('[data-blog-controller]'))) {
    const rawController = controller.getAttribute('data-blog-controller') ?? '';
    const publishedPrefix = `/posts/${slug}/`;
    if (ROOTED_OR_REMOTE.test(rawController) && !rawController.startsWith(publishedPrefix)) {
      throw new Error('data-blog-controller must reference a local module');
    }
    const resolved = rawController.startsWith(publishedPrefix)
      ? (() => {
          const file = resolve(postDir, rawController.slice(publishedPrefix.length));
          assertInside(postDir, file, `Blog controller "${rawController}"`);
          return { href: rawController, file };
        })()
      : resolveLocalReference(rawController, { baseDir, postDir, slug });
    if (!resolved.href) {
      throw new Error('data-blog-controller cannot be empty');
    }
    if (!/\.m?js$/i.test(resolved.href)) {
      throw new Error('data-blog-controller must reference a JavaScript module');
    }
    if (!resolved.file || !existsSync(resolved.file)) {
      throw new Error(`Blog controller does not exist: ${rawController}`);
    }
    controller.setAttribute('data-blog-controller', resolved.href);
  }
}

export function renderHtmlFragments(document, { postsDir, slug, getImageDimensions = () => null }) {
  const postDir = resolve(postsDir, slug);

  for (const node of Array.from(document.querySelectorAll('html-fragment'))) {
    const rawSource = node.getAttribute('src')?.trim() ?? '';
    if (!rawSource || ROOTED_OR_REMOTE.test(rawSource)) {
      throw new Error('<html-fragment> src must be a local, post-relative HTML file');
    }

    const fragmentPath = resolve(postDir, rawSource);
    assertInside(postDir, fragmentPath, `HTML fragment "${rawSource}"`);
    if (extname(fragmentPath).toLowerCase() !== '.html') {
      throw new Error(`<html-fragment> only supports .html files: ${rawSource}`);
    }

    const fragmentDom = new JSDOM(readFileSync(fragmentPath, 'utf-8'));
    const fragmentDocument = fragmentDom.window.document;
    inlineLocalStylesheets(fragmentDocument, {
      baseDir: dirname(fragmentPath),
      postDir,
    });
    normalizeHtmlAssets(fragmentDocument, {
      baseDir: dirname(fragmentPath),
      postDir,
      slug,
      getImageDimensions,
    });

    const fragmentNodes = [];

    for (const style of Array.from(
      fragmentDocument.head.querySelectorAll('style, link[rel="stylesheet"]'),
    )) {
      fragmentNodes.push(document.importNode(style, true));
    }

    for (const child of Array.from(fragmentDocument.body.childNodes)) {
      fragmentNodes.push(document.importNode(child, true));
    }

    if (node.hasAttribute('wide')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'html-fragment html-fragment--wide';
      wrapper.dataset['htmlFragment'] = rawSource;
      wrapper.append(...fragmentNodes);
      node.replaceWith(wrapper);
      continue;
    }

    node.replaceWith(...fragmentNodes);
  }
}
