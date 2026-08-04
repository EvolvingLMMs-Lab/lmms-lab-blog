const DEFAULT_HEIGHT = 680;
const MIN_HEIGHT = 360;
const MAX_HEIGHT = 1200;
const DEFAULT_ALLOW =
  'accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
const DEFAULT_SANDBOX = [
  'allow-downloads',
  'allow-forms',
  'allow-modals',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-presentation',
  'allow-same-origin',
  'allow-scripts',
].join(' ');

export const webEmbedBlock = {
  name: 'webEmbedBlock',
  level: 'block',
  start(source) {
    return source.match(/<web-embed\b/i)?.index;
  },
  tokenizer(source) {
    const match = source.match(/^<web-embed\b[\s\S]*?<\/web-embed>[ \t]*(?:\n|$)/i);
    if (!match) {
      return undefined;
    }
    return {
      type: 'webEmbedBlock',
      raw: match[0],
    };
  },
  renderer(token) {
    return `${token.raw}\n`;
  },
};

function parseSource(rawSource) {
  const source = rawSource.trim();
  if (source.startsWith('/')) {
    return { source, hostname: 'blog.lmms-lab.com' };
  }

  let url;
  try {
    url = new URL(source);
  } catch {
    throw new Error(`<web-embed> has an invalid src: ${source || '(empty)'}`);
  }

  if (url.protocol !== 'https:') {
    throw new Error(`<web-embed> only supports HTTPS or root-relative URLs: ${source}`);
  }

  return {
    source: url.href,
    hostname: url.hostname.replace(/^www\./, ''),
  };
}

function parseHeight(rawHeight) {
  const parsed = Number.parseInt(rawHeight ?? '', 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_HEIGHT;
  }
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, parsed));
}

function appendIcon(document, parent, className) {
  const icon = document.createElement('i');
  icon.className = `ph ${className}`;
  icon.setAttribute('aria-hidden', 'true');
  parent.append(icon);
}

function createActionButton(document, className, label, iconClass) {
  const button = document.createElement('button');
  button.className = `web-embed__action ${className}`;
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  appendIcon(document, button, iconClass);
  return button;
}

export function renderWebEmbeds(document) {
  for (const node of Array.from(document.querySelectorAll('web-embed'))) {
    const rawSource = node.getAttribute('src') ?? '';
    const { source, hostname } = parseSource(rawSource);
    const title = node.getAttribute('title')?.trim() || `Interactive content from ${hostname}`;
    const caption =
      node.getAttribute('caption')?.trim() ||
      node.textContent?.trim() ||
      `Interactive web content hosted on ${hostname}.`;
    const height = parseHeight(node.getAttribute('height'));
    const loading = node.getAttribute('loading') === 'eager' ? 'eager' : 'lazy';

    const figure = document.createElement('figure');
    figure.className = 'web-embed';
    if (node.hasAttribute('wide')) {
      figure.classList.add('web-embed--wide');
    }
    figure.dataset['webEmbed'] = '';
    figure.dataset['webEmbedSource'] = source;
    figure.style.setProperty('--web-embed-height', `${height}px`);

    const toolbar = document.createElement('div');
    toolbar.className = 'web-embed__toolbar';

    const trafficLights = document.createElement('span');
    trafficLights.className = 'web-embed__traffic-lights';
    trafficLights.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 3; index += 1) {
      trafficLights.append(document.createElement('span'));
    }

    const address = document.createElement('div');
    address.className = 'web-embed__address';
    appendIcon(document, address, 'ph-globe-simple');

    const addressText = document.createElement('span');
    addressText.className = 'web-embed__address-text';

    const addressTitle = document.createElement('span');
    addressTitle.className = 'web-embed__title';
    addressTitle.textContent = title;

    const addressHost = document.createElement('span');
    addressHost.className = 'web-embed__host';
    addressHost.textContent = hostname;

    addressText.append(addressTitle, addressHost);
    address.append(addressText);

    const actions = document.createElement('div');
    actions.className = 'web-embed__actions';
    actions.append(
      createActionButton(
        document,
        'web-embed__reload',
        'Reload embedded page',
        'ph-arrow-clockwise',
      ),
      createActionButton(document, 'web-embed__fullscreen', 'Enter fullscreen', 'ph-corners-out'),
    );

    const externalLink = document.createElement('a');
    externalLink.className = 'web-embed__action web-embed__external';
    externalLink.href = source;
    externalLink.target = '_blank';
    externalLink.rel = 'noopener noreferrer';
    externalLink.title = 'Open embedded page in a new tab';
    externalLink.setAttribute('aria-label', 'Open embedded page in a new tab');
    appendIcon(document, externalLink, 'ph-arrow-square-out');
    actions.append(externalLink);

    toolbar.append(trafficLights, address, actions);

    const viewport = document.createElement('div');
    viewport.className = 'web-embed__viewport';

    const loader = document.createElement('div');
    loader.className = 'web-embed__loader';
    loader.setAttribute('aria-hidden', 'true');

    const iframe = document.createElement('iframe');
    iframe.className = 'web-embed__frame';
    iframe.src = source;
    iframe.title = title;
    iframe.setAttribute('loading', loading);
    iframe.setAttribute('sandbox', DEFAULT_SANDBOX);
    iframe.setAttribute('allow', node.getAttribute('allow')?.trim() || DEFAULT_ALLOW);
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');

    viewport.append(loader, iframe);

    const figcaption = document.createElement('figcaption');
    figcaption.className = 'web-embed__caption';

    const captionText = document.createElement('span');
    captionText.textContent = caption;

    const fallbackLink = document.createElement('a');
    fallbackLink.href = source;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = 'Open source page';
    appendIcon(document, fallbackLink, 'ph-arrow-up-right');

    figcaption.append(captionText, fallbackLink);
    figure.append(toolbar, viewport, figcaption);
    node.replaceWith(figure);
  }
}
