const DEFAULT_VIDEO_WIDTH = '1280';
const DEFAULT_VIDEO_HEIGHT = '720';

const VIDEO_MIME_TYPES = new Map([
  ['.m3u8', 'application/vnd.apple.mpegurl'],
  ['.mpd', 'application/dash+xml'],
  ['.mp4', 'video/mp4'],
  ['.m4v', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.ogv', 'video/ogg'],
  ['.ogg', 'video/ogg'],
  ['.mov', 'video/quicktime'],
]);

export const blogVideoBlock = {
  name: 'blogVideoBlock',
  level: 'block',
  start(source) {
    return source.match(/<blog-video\b/i)?.index;
  },
  tokenizer(source) {
    const match = source.match(/^<blog-video\b[\s\S]*?<\/blog-video>[ \t]*(?:\n|$)/i);
    if (!match) {
      return undefined;
    }

    return {
      type: 'blogVideoBlock',
      raw: match[0],
    };
  },
  renderer(token) {
    return `${token.raw}\n`;
  },
};

function inferVideoMimeType(source) {
  let pathname = source;

  try {
    pathname = new URL(source, 'https://blog.lmms-lab.com').pathname;
  } catch {
    pathname = source.split(/[?#]/, 1)[0];
  }

  const extension = pathname.match(/\.[^.\/]+$/)?.[0].toLowerCase();
  return extension ? VIDEO_MIME_TYPES.get(extension) : undefined;
}

function copyAttribute(source, target, name) {
  const value = source.getAttribute(name);
  if (value !== null) {
    target.setAttribute(name, value);
  }
}

function copyBooleanAttribute(source, target, name) {
  if (source.hasAttribute(name)) {
    target.setAttribute(name, '');
  }
}

export function renderBlogVideos(document) {
  for (const node of Array.from(document.querySelectorAll('blog-video'))) {
    const sourceHref = node.getAttribute('src')?.trim() ?? '';
    if (!sourceHref) {
      throw new Error('<blog-video> requires a non-empty src attribute');
    }

    const caption = node.getAttribute('caption')?.trim() ?? '';
    const label =
      node.getAttribute('aria-label')?.trim() ||
      node.getAttribute('title')?.trim() ||
      caption ||
      'Article video';

    const figure = document.createElement('figure');
    figure.className = 'media-figure';
    figure.dataset['blogVideo'] = '';

    const video = document.createElement('video');
    video.setAttribute('controls', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-label', label);

    for (const attribute of [
      'poster',
      'preload',
      'crossorigin',
      'width',
      'height',
      'title',
      'controlslist',
    ]) {
      copyAttribute(node, video, attribute);
    }

    for (const attribute of ['autoplay', 'loop', 'muted', 'disablepictureinpicture']) {
      copyBooleanAttribute(node, video, attribute);
    }

    if (!video.hasAttribute('preload')) {
      video.setAttribute('preload', 'metadata');
    }
    if (!video.hasAttribute('width') && !video.hasAttribute('height')) {
      video.setAttribute('width', DEFAULT_VIDEO_WIDTH);
      video.setAttribute('height', DEFAULT_VIDEO_HEIGHT);
    }

    const primarySource = document.createElement('source');
    primarySource.setAttribute('src', sourceHref);
    const sourceType = node.getAttribute('type')?.trim() || inferVideoMimeType(sourceHref);
    if (sourceType) {
      primarySource.setAttribute('type', sourceType);
    }
    video.append(primarySource);

    for (const fallback of Array.from(node.querySelectorAll('source, track'))) {
      video.append(document.importNode(fallback, true));
    }

    video.append(document.createTextNode('Your browser does not support embedded video.'));
    figure.append(video);

    if (caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;
      figure.append(figcaption);
    }

    node.replaceWith(figure);
  }
}
