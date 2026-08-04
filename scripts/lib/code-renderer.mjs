import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers';

const CATPPUCCIN_LATTE_COLORS = new Map(
  Object.entries({
    rosewater: '#dc8a78',
    flamingo: '#dd7878',
    pink: '#ea76cb',
    mauve: '#8839ef',
    red: '#d20f39',
    maroon: '#e64553',
    peach: '#fe640b',
    yellow: '#df8e1d',
    green: '#40a02b',
    teal: '#179299',
    sky: '#04a5e5',
    sapphire: '#209fb5',
    blue: '#1e66f5',
    lavender: '#7287fd',
    text: '#4c4f69',
    subtext1: '#5c5f77',
    subtext0: '#6c6f85',
    overlay2: '#7c7f93',
    overlay1: '#8c8fa1',
    overlay0: '#9ca0b0',
    surface2: '#acb0be',
    surface1: '#bcc0cc',
    surface0: '#ccd0da',
    base: '#eff1f5',
    mantle: '#e6e9ef',
    crust: '#dce0e8',
  }).map(([name, color]) => [color, `var(--ctp-${name})`]),
);

function replaceInlineCatppuccinColors(html) {
  return html.replace(/style="([^"]*)"/g, (attribute, style) => {
    const nextStyle = style.replace(/#[0-9a-f]{6}\b/gi, (color) => {
      return CATPPUCCIN_LATTE_COLORS.get(color.toLowerCase()) ?? color;
    });

    return attribute.replace(style, nextStyle);
  });
}

export function createCodeRenderer(highlighter) {
  return function code({ text, lang }) {
    const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
    const html = replaceInlineCatppuccinColors(
      highlighter.codeToHtml(text, {
        lang: language,
        theme: 'catppuccin-latte',
        transformers: [transformerNotationDiff(), transformerNotationHighlight()],
      }),
    );
    const langLabel = language !== 'text' ? language : 'code';
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${langLabel}</span><button class="code-copy" type="button" aria-label="Copy code">Copy</button></div>${html}</div>`;
  };
}
