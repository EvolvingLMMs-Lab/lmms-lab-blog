import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const LEGACY_ROOT = resolve(process.argv[2] || '');
const POSTS_DIR = join(PROJECT_ROOT, 'content/posts');

if (!process.argv[2] || !existsSync(join(LEGACY_ROOT, 'out'))) {
  throw new Error('Usage: node scripts/import-showcase-posts.mjs /path/to/built/lmms-lab-website');
}

const DEFINITIONS = [
  {
    slug: 'llava-onevision-1-5',
    legacySlug: 'llava_onevision_1_5',
    selector: '.lov15-container',
    stylesheet: 'app/posts/[slug]/llava-ov-1-5.css',
    family: 'lov15',
  },
  {
    slug: 'llava-onevision-1-5-rl',
    legacySlug: 'llava_onevision_1.5_rl',
    selector: '.lov15-container',
    stylesheet: 'app/posts/[slug]/llava-ov-1-5.css',
    family: 'lov15',
  },
  {
    slug: 'longvt',
    legacySlug: 'longvt',
    selector: '.lov15-container',
    stylesheet: 'app/posts/[slug]/llava-ov-1-5.css',
    family: 'longvt',
  },
  {
    slug: 'llava-onevision-2',
    legacySlug: 'llava_onevision_2',
    selector: '#lov2-page',
    stylesheet: 'app/posts/[slug]/llava-ov-2.css',
    family: 'lov2',
  },
];

function splitCurrentSource(source, sourcePath) {
  const match = /^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/.exec(source);
  if (!match) throw new Error(`Current source has no front matter: ${sourcePath}`);
  const frontMatter = match[0].includes('\nlayout:')
    ? match[0].replace(/\nlayout:\s*[^\n]+/, '\nlayout: showcase')
    : match[0].replace(/\r?\n---\s*\r?\n$/, '\nlayout: showcase\n---\n');
  return frontMatter;
}

function replaceTag(element, tagName) {
  const replacement = element.ownerDocument.createElement(tagName);
  for (const attribute of element.attributes) {
    replacement.setAttribute(attribute.name, attribute.value);
  }
  replacement.append(...element.childNodes);
  element.replaceWith(replacement);
  return replacement;
}

function unwrapExpression(node) {
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return unwrapExpression(node.expression);
  }
  return node;
}

function literalValue(expression) {
  const node = unwrapExpression(expression);
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    return -Number(literalValue(node.operand));
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => literalValue(element));
  }
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.filter(ts.isPropertyAssignment).map((property) => {
        const name = property.name;
        const key = ts.isComputedPropertyName(name)
          ? String(literalValue(name.expression))
          : name.text;
        return [key, literalValue(property.initializer)];
      }),
    );
  }
  throw new Error(`Unsupported literal node in legacy showcase: ${ts.SyntaxKind[node.kind]}`);
}

function readLiteralConstant(sourcePath, constantName) {
  const source = readFileSync(sourcePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === constantName &&
        declaration.initializer
      ) {
        return literalValue(declaration.initializer);
      }
    }
  }
  throw new Error(`Missing ${constantName} in ${sourcePath}`);
}

function createSvgElement(document, tagName, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function appendResolutionChart(document, container, data, rowName) {
  if (!Array.isArray(data) || data.length === 0) return;
  const total = data.reduce((sum, point) => sum + point.count, 0);
  const minimumCount = Math.max(2, Math.ceil(total * 0.01));
  const filtered = data.filter((point) => point.count >= minimumCount);
  const points = filtered.length > 0 ? filtered : data;
  const width = 360;
  const height = 220;
  const padding = { left: 44, right: 14, top: 12, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xMax = Math.ceil(Math.max(...points.map((point) => point.w)) / 100) * 100;
  const yMax = Math.ceil(Math.max(...points.map((point) => point.h)) / 100) * 100;
  const maxCount = Math.max(...points.map((point) => point.count));
  const svg = createSvgElement(document, 'svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'chart-svg',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': `Resolution distribution for ${rowName}`,
  });

  for (let index = 0; index <= 4; index += 1) {
    const x = padding.left + (index / 4) * plotWidth;
    const xValue = Math.round((index / 4) * xMax);
    svg.append(
      createSvgElement(document, 'line', {
        x1: x,
        y1: padding.top,
        x2: x,
        y2: padding.top + plotHeight,
        class: 'chart-grid',
      }),
    );
    const xLabel = createSvgElement(document, 'text', {
      x,
      y: padding.top + plotHeight + 14,
      class: 'chart-tick',
      'text-anchor': 'middle',
    });
    xLabel.textContent = String(xValue);
    svg.append(xLabel);

    const y = padding.top + (index / 4) * plotHeight;
    const yValue = Math.round(((4 - index) / 4) * yMax);
    svg.append(
      createSvgElement(document, 'line', {
        x1: padding.left,
        y1: y,
        x2: padding.left + plotWidth,
        y2: y,
        class: 'chart-grid',
      }),
    );
    const yLabel = createSvgElement(document, 'text', {
      x: padding.left - 6,
      y: y + 4,
      class: 'chart-tick',
      'text-anchor': 'end',
    });
    yLabel.textContent = String(yValue);
    svg.append(yLabel);
  }

  for (const point of points) {
    const group = createSvgElement(document, 'g', { class: 'chart-dot' });
    const radius = 3 + Math.sqrt(point.count / maxCount) * 15;
    group.append(
      createSvgElement(document, 'circle', {
        cx: padding.left + (point.w / xMax) * plotWidth,
        cy: padding.top + plotHeight - (point.h / yMax) * plotHeight,
        r: radius,
        class: 'chart-dot-circle',
      }),
    );
    const title = createSvgElement(document, 'title');
    title.textContent = `${point.w}×${point.h} — ${point.count} videos`;
    group.append(title);
    svg.append(group);
  }
  container.append(svg);
}

function appendDurationChart(document, container, payload, rowName) {
  if (!payload?.bins?.length) return;
  const totalBins = payload.bins.reduce((sum, bin) => sum + bin.count, 0);
  const minimumCount = Math.max(1, Math.ceil(totalBins * 0.01));
  let lowIndex = 0;
  let highIndex = payload.bins.length - 1;
  while (lowIndex < highIndex && payload.bins[lowIndex].count < minimumCount) lowIndex += 1;
  while (highIndex > lowIndex && payload.bins[highIndex].count < minimumCount) highIndex -= 1;
  const bins = payload.bins.slice(lowIndex, highIndex + 1);
  const width = 360;
  const height = 220;
  const padding = { left: 36, right: 14, top: 12, bottom: 38 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maximumCount = Math.max(1, ...bins.map((bin) => bin.count));
  const barWidth = (plotWidth / bins.length) * 0.78;
  const gap = (plotWidth / bins.length) * 0.22;
  const svg = createSvgElement(document, 'svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'chart-svg',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': `Duration distribution for ${rowName}`,
  });

  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (index / 4) * plotHeight;
    const value = Math.round(((4 - index) / 4) * maximumCount);
    svg.append(
      createSvgElement(document, 'line', {
        x1: padding.left,
        y1: y,
        x2: padding.left + plotWidth,
        y2: y,
        class: 'chart-grid',
      }),
    );
    const label = createSvgElement(document, 'text', {
      x: padding.left - 6,
      y: y + 4,
      class: 'chart-tick',
      'text-anchor': 'end',
    });
    label.textContent = String(value);
    svg.append(label);
  }

  const visibleTotal = bins.reduce((sum, bin) => sum + bin.count, 0);
  bins.forEach((bin, index) => {
    const x = padding.left + index * (plotWidth / bins.length) + gap / 2;
    const barHeight = (bin.count / maximumCount) * plotHeight;
    const y = padding.top + plotHeight - barHeight;
    const group = createSvgElement(document, 'g', { class: 'chart-bar' });
    group.append(
      createSvgElement(document, 'rect', {
        x,
        y,
        width: barWidth,
        height: barHeight,
        rx: 2,
        ry: 2,
        class: 'chart-bar-rect',
      }),
    );
    if (bin.count > 0) {
      const value = createSvgElement(document, 'text', {
        x: x + barWidth / 2,
        y: y - 3,
        class: 'chart-bar-value',
        'text-anchor': 'middle',
      });
      value.textContent = String(bin.count);
      group.append(value);
    }
    const label = createSvgElement(document, 'text', {
      x: x + barWidth / 2,
      y: padding.top + plotHeight + 14,
      class: 'chart-tick',
      'text-anchor': 'middle',
    });
    label.textContent = `${bin.lo}–${bin.hi}`;
    group.append(label);
    const title = createSvgElement(document, 'title');
    const percent = visibleTotal > 0 ? ((bin.count / visibleTotal) * 100).toFixed(1) : '0';
    title.textContent = `${bin.lo}–${bin.hi}${payload.unit || 's'} — ${bin.count} videos (${percent}%)`;
    group.append(title);
    svg.append(group);
  });
  container.append(svg);
}

function appendBenchmarkChart(document, charts, title, render) {
  const chart = document.createElement('div');
  chart.className = 'bench-chart';
  const heading = document.createElement('div');
  heading.className = 'bench-chart-title';
  const english = document.createElement('span');
  english.className = 'i18n';
  english.dataset.lang = 'en';
  english.textContent = title.en;
  const chinese = document.createElement('span');
  chinese.className = 'i18n';
  chinese.dataset.lang = 'zh';
  chinese.textContent = title.zh;
  heading.append(english, chinese);
  const canvas = document.createElement('div');
  canvas.className = 'bench-chart-svg';
  render(canvas);
  chart.append(heading, canvas);
  charts.append(chart);
}

function hydrateBenchmarkDetails(root, sourcePath, chartsPath) {
  const groups = [
    'videoBenchmarks',
    'spatialBenchmarks',
    'imageBenchmarks',
    'trackingBenchmarks',
  ].map((name) => readLiteralConstant(sourcePath, name));
  const rowByName = new Map(groups.flatMap((group) => group.rows).map((row) => [row.name, row]));
  const chartData = JSON.parse(readFileSync(chartsPath, 'utf8'));
  const document = root.ownerDocument;

  for (const button of root.querySelectorAll('.bench-expand')) {
    const name = button.querySelector('.bench-expand-name')?.textContent?.trim();
    const row = name ? rowByName.get(name) : null;
    const benchmarkRow = button.closest('tr');
    if (!row?.summary || !benchmarkRow) continue;

    button.dataset.benchmarkId = row.id;
    button.setAttribute('aria-controls', `benchmark-detail-${row.id}`);
    const detailRow = document.createElement('tr');
    detailRow.id = `benchmark-detail-${row.id}`;
    detailRow.className = 'benchmark-detail-row';
    detailRow.hidden = true;
    const cell = document.createElement('td');
    cell.colSpan = 7;
    const panel = document.createElement('div');
    panel.className = 'bench-detail-panel';
    const charts = document.createElement('div');
    charts.className = 'bench-detail-charts';
    const payload = chartData[row.id];
    if (payload?.resolution?.length) {
      appendBenchmarkChart(
        document,
        charts,
        { en: 'Resolution Distribution', zh: '分辨率分布' },
        (canvas) => appendResolutionChart(document, canvas, payload.resolution, row.name),
      );
    }
    if (payload?.duration?.bins?.length) {
      const unit = payload.duration.unit || 's';
      appendBenchmarkChart(
        document,
        charts,
        {
          en: `Duration Distribution (${unit})`,
          zh: `时长分布 (${unit === 'min' ? '分钟' : '秒'})`,
        },
        (canvas) => appendDurationChart(document, canvas, payload.duration, row.name),
      );
    }

    const meta = document.createElement('div');
    meta.className = 'bench-detail-meta';
    const summary = document.createElement('p');
    summary.className = 'bench-detail-summary';
    summary.textContent = row.summary;
    meta.append(summary);
    if (row.badges?.length) {
      const badges = document.createElement('div');
      badges.className = 'bench-detail-badges';
      for (const badge of row.badges) {
        const element = document.createElement('span');
        element.className = 'bench-tag';
        element.textContent = badge;
        badges.append(element);
      }
      meta.append(badges);
    }
    if (row.example) {
      const example = document.createElement('div');
      example.className = 'bench-detail-example';
      const label = document.createElement('div');
      label.className = 'bench-detail-example-label';
      label.textContent = row.example.label;
      const question = document.createElement('div');
      question.className = 'bench-detail-example-qa';
      const questionLabel = document.createElement('strong');
      questionLabel.textContent = 'Q:';
      question.append(questionLabel, ` ${row.example.question}`);
      const answer = document.createElement('div');
      answer.className = 'bench-detail-example-qa bench-detail-example-answer';
      const answerLabel = document.createElement('strong');
      answerLabel.textContent = 'A:';
      answer.append(answerLabel, ` ${row.example.answer}`);
      example.append(label, question, answer);
      meta.append(example);
    }

    if (charts.childElementCount > 0) panel.append(charts);
    panel.append(meta);
    cell.append(panel);
    detailRow.append(cell);
    benchmarkRow.after(detailRow);
  }
}

function safeName(source) {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function materializeMedia(rawHref, showcaseDir) {
  if (!rawHref.startsWith('/images/') && !rawHref.startsWith('/posts/')) return rawHref;
  const source = join(LEGACY_ROOT, 'public', rawHref.replace(/^\/+/, ''));
  if (!existsSync(source)) return rawHref;

  const extension = extname(source).toLowerCase();
  const outputExtension = extension === '.gif' ? '.webm' : '.avif';
  const fileName = `${safeName(basename(source, extension))}${outputExtension}`;
  const mediaDir = join(showcaseDir, 'media');
  const target = join(mediaDir, fileName);
  mkdirSync(mediaDir, { recursive: true });

  if (extension === '.gif') {
    execFileSync(
      'ffmpeg',
      [
        '-loglevel',
        'error',
        '-y',
        '-i',
        source,
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
        target,
      ],
      { stdio: 'ignore' },
    );
  } else {
    execFileSync(
      'convert',
      [
        source,
        '-auto-orient',
        '-resize',
        '2400x2400>',
        '-strip',
        '-quality',
        '76',
        '-define',
        'heic:speed=8',
        target,
      ],
      { stdio: 'ignore' },
    );
  }

  return `./media/${fileName}`;
}

function longvtPalette(css) {
  const replacements = new Map([
    ['#ffffff', 'var(--background)'],
    ['#fff', 'var(--background)'],
    ['#fcfcfd', 'var(--background)'],
    ['#f7f9fc', 'rgb(var(--foreground-rgb) / 4%)'],
    ['#eff5fb', 'rgb(var(--foreground-rgb) / 7%)'],
    ['#000', 'var(--foreground)'],
    ['#1a1a1a', 'var(--foreground)'],
    ['#2b2b2b', 'var(--foreground)'],
    ['#1f2937', 'var(--foreground)'],
    ['#334155', 'rgb(var(--foreground-rgb) / 82%)'],
    ['#444', 'rgb(var(--foreground-rgb) / 78%)'],
    ['#4b5563', 'rgb(var(--foreground-rgb) / 72%)'],
    ['#03639a', 'var(--foreground)'],
    ['#0b5f92', 'var(--foreground)'],
    ['#024a75', 'var(--foreground)'],
  ]);
  return css.replace(
    /#[0-9a-f]{3,8}\b/gi,
    (color) => replacements.get(color.toLowerCase()) || color,
  );
}

function mapLegacyFonts(css) {
  // The React project pages relied on fonts supplied by their original Next.js
  // shell. Once their markup is hosted by Angular those family names no longer
  // have a face behind them, and browsers without system fonts collapse the
  // affected text to zero-height line boxes. Map the legacy typography roles to
  // the variable fonts that the Angular shell already validates and registers.
  const families = new Map([
    ['"Source Sans 3"', 'RobotoVariable'],
    ["'Source Sans 3'", 'RobotoVariable'],
    ['"Source Serif 4"', 'SpaceGroteskVariable'],
    ["'Source Serif 4'", 'SpaceGroteskVariable'],
    ['"JetBrains Mono"', 'GoogleSansCodeVariable'],
    ["'JetBrains Mono'", 'GoogleSansCodeVariable'],
    ['"SF Mono"', 'GoogleSansCodeVariable'],
    ["'SF Mono'", 'GoogleSansCodeVariable'],
    ['"Times New Roman"', 'SpaceGroteskVariable'],
    ["'Times New Roman'", 'SpaceGroteskVariable'],
  ]);

  let mapped = css;
  for (const [legacyFamily, bundledFamily] of families) {
    mapped = mapped.replaceAll(legacyFamily, bundledFamily);
  }
  return mapped;
}

function adapterCss(family) {
  const shared = `
/* Angular host adapter: preserve the legacy composition inside the unified blue paper. */
.legacy-showcase {
  /* Compatibility shims for the legacy project-page palette. */
  --foreground: var(--text-color);
  --foreground-rgb: 254 215 170;
  --background-rgb: 3 99 154;
  --font-sans: var(--font-body);
  --text-body: 1rem;
  --text-heading: clamp(2.3rem, 5vw, 4rem);
  --text-subheading: clamp(1.45rem, 3vw, 1.8rem);
  --text-caption: 0.72rem;
}
.legacy-showcase img,
.legacy-showcase video { border-radius: 0 !important; }
.legacy-showcase svg text,
.legacy-showcase svg tspan { font-family: var(--font-body); }
.legacy-showcase :focus-visible { outline: 2px solid var(--ctp-peach); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .legacy-showcase *, .legacy-showcase *::before, .legacy-showcase *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
@media print {
  .legacy-showcase {
    --foreground: #1a1a1a;
    --foreground-rgb: 26 26 26;
    --background-rgb: 255 255 255;
  }
}
`;
  if (family === 'lov2') {
    return `${shared}
#lov2-page {
  --bg: var(--background);
  --bg-alt: transparent;
  --bg-code: rgb(var(--foreground-rgb) / 6%);
  --bg-highlight: rgb(var(--foreground-rgb) / 9%);
  --text-primary: var(--foreground);
  --text-secondary: rgb(var(--foreground-rgb) / 82%);
  --text-muted: rgb(var(--foreground-rgb) / 66%);
  --text-heading: var(--foreground);
  --accent: var(--ctp-peach);
  --accent-dark: var(--foreground);
  --accent-bg: rgb(var(--foreground-rgb) / 9%);
  --border: rgb(var(--foreground-rgb) / 20%);
  --border-light: rgb(var(--foreground-rgb) / 10%);
  --navbar-bg: rgb(var(--background-rgb) / 92%);
  --card-bg: transparent;
  --shadow: transparent;
  width: 100%;
  background: transparent;
  font-family: var(--font-body);
}
#lov2-page .theme-switcher { display: none; }
#lov2-page .site-navbar { top: 3.75rem; }
`;
  }
  return `${shared}
.lov15-container {
  min-height: 0;
  padding: clamp(1rem, 3vw, 2rem) 0;
  background: transparent;
  font-family: var(--font-body);
}
.lov15-wrapper { width: 100%; }
.lov15-title { font-weight: 650; letter-spacing: -0.045em; }
.lov15-tag { border-radius: 0; }
.lov15-resource-card,
.lov15-image-wrapper,
.rl-hero-card { border-radius: 0 !important; box-shadow: none !important; }
@media (max-width: 600px) {
  .lov15-wrapper,
  .lov15-code-demo { min-width: 0; max-width: 100%; }
  .lov15-code-toolbar { flex-wrap: wrap; }
  .lov15-code-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .disc-bars { gap: 0.5rem; justify-content: space-between; }
  .disc-bar-group { min-width: 0; flex: 1; padding: 0.25rem; }
  .disc-bar-group.disc-selected-group {
    margin: 0;
    padding: 0.45rem 0.2rem;
  }
  .disc-bar-wrap { width: 100%; justify-content: center; gap: 3px; }
  .disc-bar { width: clamp(1.5rem, 8vw, 2.1rem); font-size: 0.62rem; }
  .disc-gap-indicator { left: calc(100% + 2px); gap: 2px; }
  .disc-gap-label { display: none; }
  .reward-filter { gap: 0.3rem; }
  .reward-zone { min-width: 0; padding: 0.65rem 0.3rem; }
  .reward-zone-select { padding: 0.8rem 0.35rem; }
  .reward-arrow { font-size: 0.8rem; }
}
`;
}

function controllerSource() {
  return `function copyCode(button) {
  const container = button.closest('.lov15-code-demo, .code-demo, .code-panel, .citation-block');
  const code = container?.querySelector('pre, code');
  if (!code) return;
  void navigator.clipboard.writeText(code.textContent || '').then(() => {
    const previous = button.textContent;
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = previous; }, 1600);
  });
}

function setupCarousel(carousel, signal) {
  const track = carousel.querySelector('.demo-carousel-track');
  const slides = Array.from(track?.querySelectorAll(':scope > .demo-slide') || []);
  if (!track || slides.length < 2) return;
  const previous = carousel.querySelector('.demo-carousel-arrow-prev');
  const next = carousel.querySelector('.demo-carousel-arrow-next');
  const dots = Array.from(carousel.querySelectorAll('.demo-carousel-dot'));
  let index = 0;

  const render = () => {
    track.style.transform = \`translateX(-\${index * 100}%)\`;
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
      if (dotIndex === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  previous?.addEventListener('click', () => { index = Math.max(0, index - 1); render(); }, { signal });
  next?.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); render(); }, { signal });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => { index = dotIndex; render(); }, { signal });
  });
  render();
}

function setupCodeTabs(panel, signal) {
  const tabs = Array.from(panel.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(panel.querySelectorAll('[role="tabpanel"]'));
  if (tabs.length !== tabPanels.length || tabs.length < 2) return;
  const select = (index) => {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tabPanels[tabIndex].classList.toggle('active', active);
      tabPanels[tabIndex].hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index), { signal });
  });
}

function setupBenchmarkDetails(host, signal) {
  let openButton = null;
  const close = (button) => {
    if (!button) return;
    button.classList.remove('expanded');
    button.setAttribute('aria-expanded', 'false');
    const detail = button.closest('tr')?.nextElementSibling;
    if (detail?.classList.contains('benchmark-detail-row')) detail.hidden = true;
  };
  for (const button of host.querySelectorAll('.bench-expand')) {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      if (openButton && openButton !== button) close(openButton);
      close(button);
      if (opening) {
        button.classList.add('expanded');
        button.setAttribute('aria-expanded', 'true');
        const detail = button.closest('tr')?.nextElementSibling;
        if (detail?.classList.contains('benchmark-detail-row')) detail.hidden = false;
        openButton = button;
      } else {
        openButton = null;
      }
    }, { signal });
  }
}

export function mount(host) {
  const abortController = new AbortController();
  const { signal } = abortController;
  for (const button of host.querySelectorAll('button')) {
    const label = (button.textContent || '').trim().toLowerCase();
    if (label.includes('copy') || String(button.className).toLowerCase().includes('copy')) {
      button.addEventListener('click', () => copyCode(button), { signal });
    }
  }

  for (const carousel of host.querySelectorAll('.demo-carousel')) {
    setupCarousel(carousel, signal);
  }

  for (const panel of host.querySelectorAll('.code-panel')) {
    setupCodeTabs(panel, signal);
  }
  setupBenchmarkDetails(host, signal);

  const languageButton = host.querySelector('.site-navbar > button.nav-item');
  try {
    if (window.localStorage.getItem('lov2-lang') === 'zh') {
      host.classList.add('lang-zh');
      if (languageButton) languageButton.textContent = 'EN';
    }
  } catch {}
  languageButton?.addEventListener('click', () => {
    const chinese = host.classList.toggle('lang-zh');
    languageButton.textContent = chinese ? 'EN' : '中文';
    languageButton.setAttribute('aria-pressed', String(chinese));
    try { window.localStorage.setItem('lov2-lang', chinese ? 'zh' : 'en'); } catch {}
  }, { signal });

  const stars = host.querySelector('.gh-stars');
  if (stars) {
    fetch('https://api.github.com/repos/EvolvingLMMs-Lab/LLaVA-OneVision-2', {
      signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((response) => response.ok ? response.json() : Promise.reject(response.status))
      .then((data) => {
        if (typeof data?.stargazers_count !== 'number') return;
        const count = data.stargazers_count.toLocaleString('en-US');
        const textNode = Array.from(stars.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = count;
        stars.setAttribute('aria-label', count + ' GitHub stars');
      })
      .catch(() => {});
  }

  return () => abortController.abort();
}
`;
}

for (const definition of DEFINITIONS) {
  const postDir = join(POSTS_DIR, definition.slug);
  const sourcePath = join(postDir, 'index.md');
  if (!existsSync(sourcePath)) throw new Error(`Missing current source: ${sourcePath}`);

  const legacyHtmlPath = join(LEGACY_ROOT, 'out/posts', definition.legacySlug, 'index.html');
  const legacyHtml = readFileSync(legacyHtmlPath, 'utf8');
  const document = new JSDOM(legacyHtml).window.document;
  const sourceRoot = document.querySelector(definition.selector);
  if (!sourceRoot) {
    throw new Error(`Cannot find ${definition.selector} in ${legacyHtmlPath}`);
  }

  const showcaseDir = join(postDir, 'showcase');
  rmSync(showcaseDir, { recursive: true, force: true });
  mkdirSync(showcaseDir, { recursive: true });

  const root = sourceRoot.cloneNode(true);
  root.classList.add('legacy-showcase');
  root.setAttribute('data-blog-controller', './showcase.mjs');

  for (const element of root.querySelectorAll('[font-family]')) {
    const family = element.getAttribute('font-family');
    if (family) element.setAttribute('font-family', mapLegacyFonts(family));
  }

  // Fragment-only URLs resolve against the document-level <base href="/"> in
  // Angular, which would send a showcase TOC back to the site root. Preserve
  // progressive enhancement by emitting the canonical article path directly.
  for (const link of root.querySelectorAll('a[href^="#"]')) {
    const href = link.getAttribute('href');
    if (href && href !== '#') link.setAttribute('href', `/blog/${definition.slug}${href}`);
  }

  if (definition.family === 'lov2') {
    for (const heading of Array.from(root.querySelectorAll('h3.toc-heading'))) {
      replaceTag(heading, 'h2');
    }
    const spotlightHeading = root.querySelector(
      '.codec-demo-spotlight h2, .codec-spotlight h2, .codec-compare h2',
    );
    if (spotlightHeading) replaceTag(spotlightHeading, 'h4');
    hydrateBenchmarkDetails(
      root,
      join(LEGACY_ROOT, 'app/posts/[slug]/llava-ov-2.tsx'),
      join(LEGACY_ROOT, 'lib/benchmark-charts.json'),
    );
  }

  const inlineStyles = Array.from(root.querySelectorAll('style')).map((style) => style.textContent);
  for (const style of root.querySelectorAll('style')) style.remove();
  for (const element of root.querySelectorAll('[src],[poster]')) {
    for (const attribute of ['src', 'poster']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const materialized = materializeMedia(value, showcaseDir);
      if (attribute === 'src' && element.tagName === 'IMG' && materialized.endsWith('.webm')) {
        const video = root.ownerDocument.createElement('video');
        for (const sourceAttribute of element.attributes) {
          if (sourceAttribute.name === 'src' || sourceAttribute.name === 'alt') continue;
          video.setAttribute(sourceAttribute.name, sourceAttribute.value);
        }
        video.src = materialized;
        video.autoplay = true;
        video.loop = true;
        // JSDOM does not serialize the runtime-only `muted` property. Emit the
        // content attribute so browsers permit silent autoplay after hydration.
        video.setAttribute('muted', '');
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        const alt = element.getAttribute('alt');
        if (alt) video.setAttribute('aria-label', alt);
        element.replaceWith(video);
        break;
      }
      element.setAttribute(attribute, materialized);
    }
  }

  const stylesheetPath = join(LEGACY_ROOT, definition.stylesheet);
  let stylesheet = readFileSync(stylesheetPath, 'utf8');
  const componentStyles = inlineStyles.join('\n\n');
  if (definition.family === 'longvt') {
    stylesheet = longvtPalette(`${stylesheet}\n\n${componentStyles}`);
  } else {
    stylesheet = `${stylesheet}\n\n${componentStyles}`;
  }
  stylesheet = mapLegacyFonts(stylesheet);
  stylesheet = `${stylesheet.trim()}\n\n${adapterCss(definition.family).trim()}\n`;
  stylesheet = stylesheet.replace(/[ \t]+$/gm, '');

  const fragment = `<link rel="stylesheet" href="/posts/${definition.slug}/showcase/showcase.css">
${root.outerHTML}
`;
  writeFileSync(join(showcaseDir, 'showcase.html'), fragment, 'utf8');
  writeFileSync(join(showcaseDir, 'showcase.css'), stylesheet, 'utf8');
  writeFileSync(join(showcaseDir, 'showcase.mjs'), controllerSource(), 'utf8');

  const frontMatter = splitCurrentSource(readFileSync(sourcePath, 'utf8'), sourcePath);
  writeFileSync(
    sourcePath,
    `${frontMatter}\n<html-fragment src="./showcase/showcase.html" wide></html-fragment>\n`,
    'utf8',
  );
  console.log(`Imported native showcase: ${definition.slug}`);
}
