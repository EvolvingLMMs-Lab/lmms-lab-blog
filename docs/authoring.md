# Blog authoring guide

This is the canonical reference for writing content for the LMMs-Lab Blog.
When the publishing pipeline gains, removes, or changes an author-facing
feature, update this guide in the same change. The same file is published at
[blog.lmms-lab.com/docs](https://blog.lmms-lab.com/docs), so the repository and
online references cannot drift apart.

## Quick start

Every post is one self-contained directory containing an index source and any
local assets it needs:

```text
content/posts/
└── my-post/
    ├── index.md
    ├── result.avif
    └── interactive/
        ├── demo.css
        └── demo.mjs
```

Use a lowercase kebab-case directory name such as `my-post`; that directory name
becomes the URL slug. Create exactly one index source inside it:

- `content/posts/<slug>/index.md` for a Markdown-first article; or
- `content/posts/<slug>/index.html` for an HTML-first article.

Markdown is the recommended default. It can alternate seamlessly with raw HTML
and post-local HTML fragments, so choosing Markdown does not limit interactive
or highly designed sections.

Start the development server with:

```bash
pnpm start
```

The post is available at `http://localhost:4200/<slug>`.

## Blog-specific syntax at a glance

Most articles only need ordinary Markdown. These are the blog's compact
extensions for richer content:

| Syntax | Purpose |
| --- | --- |
| `<ai-img>./summary.avif</ai-img>` | Add an AI-summary image button beside a heading. |
| `<blog-video src="./demo.m3u8"></blog-video>` | Add a Vidstack-enhanced video with sensible defaults. |
| `<html-fragment src="./demo.html"></html-fragment>` | Insert a post-local native HTML fragment into the Markdown flow. |
| `<html-fragment src="./demo.html" wide></html-fragment>` | Let a genuinely wide fragment break out of the reading column. |
| `data-blog-controller="./demo.mjs"` | Progressively enhance native HTML with a local controller module. |
| `$...$` and `$$...$$` | Typeset inline and display mathematics. |

The sections below define the attributes, asset rules, fallbacks, and complete
examples for each extension.

## Metadata

Start every `index.md` or `index.html` with YAML front matter:

```yaml
---
title: 'A descriptive post title'
date: '2026-08-04'
description: >-
  A concise summary used on the blog index.
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Displayed as the article title and on the blog index. |
| `date` | Yes | Use `YYYY-MM-DD`. Posts are sorted newest first. |
| `description` | Yes | Keep it short enough to scan on the index page. |

The opening delimiter must be the first line of the file. Quote the date so its
string type is explicit. Unknown fields, malformed YAML, invalid calendar dates,
missing fields, and empty article bodies fail generation with the source path in
the error. Front matter is removed before Markdown or HTML rendering.

Do not add the title as an `h1` in the content source. The blog shell already
renders the title and date.

## Markdown features

The Markdown pipeline is based on Marked and adds blog-specific rendering for
headings, code, tables, math, images, and native HTML.

### Headings and the table of contents

Use `##` for major sections and `###` for subsections:

```markdown
## Method

### Training objective
```

Level-two and level-three headings are added to the table of contents. Heading
IDs are generated from their visible text and duplicate IDs receive a numeric
suffix. An explicit HTML `id` is preserved when possible.

The contents panel follows the active section as the reader scrolls. Long
contents lists scroll inside the panel, so the title and four-corner frame stay
fixed. On narrow screens it opens as an accessible drawer: focus remains inside
the drawer until it is closed with a link, the close button, the backdrop, or
the Escape key.

Reader position is preserved across browser refreshes and back/forward
navigation. A newly opened URL with a heading fragment still jumps to that
heading; refreshing after further scrolling restores the exact viewport instead.
Static-route URLs with and without a trailing slash share the same saved position.
Selecting a contents entry updates only the fragment, preserving the current
post pathname and query parameters.

Use deeper headings only for local structure. They are rendered normally but
are not included in the table of contents.

### Ordinary Markdown

The usual Markdown constructs are supported:

- emphasis and strong emphasis;
- ordered and unordered lists;
- links;
- blockquotes;
- inline code;
- thematic breaks; and
- raw HTML blocks.

The post stylesheet also provides a native presentation for `<details>`:

```html
<details>
  <summary>Implementation notes</summary>
  <p>Additional material that does not need to interrupt the main argument.</p>
</details>
```

### Tables

Write a standard Markdown table:

```markdown
| Model | Accuracy | Tokens |
| --- | ---: | ---: |
| Baseline | 72.1 | 1024 |
| Ours | **78.4** | **256** |
```

Tables use a booktabs-style presentation and are automatically placed in a
horizontally scrollable wrapper on narrow screens. Markdown alignment markers
are preserved.

### Code

Fenced code blocks are highlighted with Shiki, use the site's adapted
Catppuccin accents, show the language, and include a copy button:

````markdown
```python
def encode(video):
    return select_salient_patches(video)
```
````

Use a valid Shiki language identifier after the opening fence. The pipeline
also supports Shiki notation for highlighted and diff lines:

````markdown
```python
dense = encode_all_patches(video)  # [!code --]
sparse = encode_salient_patches(video)  # [!code ++]
score = evaluate(sparse)  # [!code highlight]
```
````

### Mathematics

Use single-dollar delimiters for inline math:

```markdown
The token budget is $N = T \times H \times W$.
```

Use double-dollar delimiters for display math:

```markdown
$$
\mathcal{L} = -\log \frac{\exp(q^\top k^+ / \tau)}
{\sum_j \exp(q^\top k_j / \tau)}
$$
```

The generator marks both forms and loads MathJax 4.1.3 only after an article
containing mathematics is mounted. Articles without mathematics do not download
MathJax. HTML-first posts may author `\\(...\\)` and `\\[...\\]` delimiters directly;
the on-demand loader recognizes those forms as well. Display equations are centered
and become horizontally scrollable when necessary.

### Images

Keep post-local images under `content/posts/<slug>/` and reference them from
Markdown with a relative path:

```markdown
![A concise description of the result.](./result.avif)
```

The generator publishes this as `/posts/<slug>/result.avif`. Static post images
receive lazy loading, asynchronous decoding, and click-to-zoom behavior. When
ImageMagick is available during generation, intrinsic width and height are
added to reduce layout shift.

Use meaningful alternative text. Prefer AVIF for committed article images
unless the source format has a specific technical purpose.

Image captions can follow the image as an emphasized paragraph:

```markdown
![Attention over the input video.](./attention.avif)

*Patch attention across the 64-frame input.*
```

### AI summary images

Place `<ai-img>` beside a heading to add a compact button that opens an image
summary in the post lightbox:

```markdown
## Architecture <ai-img>./architecture-summary.avif</ai-img>
```

The explicit attribute form supports custom accessible text:

```html
<ai-img
  src="./architecture-summary.avif"
  label="Visual summary"
  alt="Diagram summarizing the encoder architecture"
></ai-img>
```

Supported attributes are `src`, `label`, `title`, `alt`, `width`, and `height`.
The image remains hidden until the button is activated.

### Video and audio

For a normal article video, one line is enough:

```html
<blog-video src="./pipeline.m3u8"></blog-video>
```

`src` is the only required attribute. The generator expands `<blog-video>` into
a semantic figure and native `<video>` fallback with controls, `playsinline`,
`preload="metadata"`, and a default 1280-by-720 aspect ratio. It infers common
media types, including HLS from `.m3u8`, and then progressively enhances the
native element with Vidstack in the browser.

A recommended authored video adds a poster and visible caption:

```html
<blog-video
  src="./pipeline.m3u8"
  poster="./pipeline-poster.avif"
  caption="Comparison of the baseline and proposed pipeline."
></blog-video>
```

Add fallback formats and captions only when needed:

```html
<blog-video
  src="./pipeline.m3u8"
  poster="./pipeline-poster.avif"
  caption="Comparison of the baseline and proposed pipeline."
  width="1280"
  height="720"
  muted
>
  <source src="./pipeline.webm" type='video/webm; codecs="vp8, vorbis"'>
  <source src="./pipeline.mp4" type='video/mp4; codecs="avc1.64001F, mp4a.40.2"'>
  <track kind="captions" src="./pipeline.en.vtt" srclang="en" label="English">
</blog-video>
```

Supported value attributes are `src`, `type`, `poster`, `caption`,
`aria-label`, `title`, `width`, `height`, `preload`, `crossorigin`, and
`controlslist`. Supported boolean attributes are `muted`, `loop`, `autoplay`,
and `disablepictureinpicture`. A caption is plain text and also becomes the
video's accessible label unless `aria-label` or `title` is supplied. Native
`<video controls>` markup remains supported when a use case needs lower-level
HTML control.

The player JavaScript loads only on articles that contain a controlled video,
adapts its controls to the available width, and supports keyboard playback,
seeking, mute, captions, picture-in-picture, and fullscreen. Native browser
controls remain available if JavaScript or the player module fails to load.

Post-local `video`, `audio`, `source`, `track`, and video `poster` paths are
rewritten to their published `/posts/<slug>/...` URLs. HTTPS media URLs remain
external. Prefer an HLS `.m3u8` primary source, followed by WebM and MP4
fallbacks; Vidstack loads the bundled `hls.js` implementation when the browser
supports it. Keep every relative segment or media URL referenced by the
manifest inside the same post asset directory. Include accurate `codecs` values
on fallbacks so the player can choose the browser's best-supported source. Avoid
autoplay for article media. Add a WebVTT captions track whenever speech or other
meaningful audio is present.

Audio continues to use native semantic HTML:

```html
<audio controls preload="metadata">
  <source src="./narration.mp3" type="audio/mpeg">
</audio>
```

### Comments

Giscus comments are appended automatically to every valid post. Authors should
not add a Giscus script to article content. The blog maps discussions by
pathname and uses the site-owned blue theme. Fenced code in comments and comment
previews is rendered on a framed, horizontally scrollable dark-blue surface;
inline code receives a smaller matching frame.

## Native HTML and Markdown flow

HTML is part of the article document, not a nested webpage. There are three
ways to use it.

### Raw HTML in Markdown

For a small semantic block, write HTML directly between Markdown blocks:

```markdown
The Markdown argument introduces the result.

<figure class="result-comparison">
  <img src="./comparison.avif" alt="Comparison of the two methods">
  <figcaption>The proposed method preserves fine motion.</figcaption>
</figure>

Markdown continues immediately after the figure.
```

Keep blank lines around block HTML. The HTML and surrounding Markdown share the
same article DOM, width, theme, and document order.

### Post-local HTML fragments

Use a fragment when the HTML is large, reusable, or easier to maintain in its
own file:

```markdown
## Interactive result

The following native view exposes individual patch positions.

<html-fragment src="./patch-viewer.html"></html-fragment>

The analysis continues in Markdown.
```

`content/posts/<slug>/patch-viewer.html` might contain:

```html
<link rel="stylesheet" href="./interactive/patch-viewer.css">

<figure class="patch-viewer">
  <div class="patch-viewer__grid"></div>
  <figcaption>Selected patches in temporal order.</figcaption>
</figure>
```

At generation time, the fragment's body nodes replace `<html-fragment>`
directly. They become siblings of the Markdown-generated nodes; no fragment
wrapper or embedded document remains.

A post-local stylesheet linked by a fragment is inlined as a `<style>` node in
the same location. Scope every rule to a unique component class such as
`.patch-viewer` to prevent it from affecting the rest of the article.

Fragment paths must:

- be relative to the post asset directory;
- resolve to a local `.html` file; and
- remain inside `content/posts/<slug>/`.

### Wide fragments

Add `wide` only when a visualization genuinely needs more horizontal room:

```html
<html-fragment src="./wide-comparison.html" wide></html-fragment>
```

Unlike a default fragment, a wide fragment keeps one transparent layout wrapper
so it can break out of the reading column responsively. It still uses the same
document, styles, theme, and JavaScript lifecycle. Wide content automatically
leaves room for the desktop table of contents and returns to the viewport width
on small screens.

### HTML-first posts

For an HTML-first article, create `content/posts/<slug>/index.html` instead of
`index.md`. Use the same YAML front matter, followed by article body content
only; do not include `<!doctype>`, `<html>`, or a duplicate page title.

HTML-first posts use the same asset normalization, native controller lifecycle,
table of contents, image behavior, comments, and site shell as Markdown posts.
Use `h2` and `h3` for headings that should appear in the table of contents.

## Interactive controllers

Inline `<script>` tags are deliberately rejected. Interactive native HTML uses
a post-local JavaScript module through `data-blog-controller`:

```html
<section class="demo" data-blog-controller="./interactive/demo.mjs">
  <button type="button" data-demo-action>Run demo</button>
  <p data-demo-status>Ready.</p>
</section>
```

The module must export `mount(host)`. It may mount synchronously or
asynchronously and may return a cleanup function:

```js
export function mount(host) {
  const button = host.querySelector('[data-demo-action]');
  const status = host.querySelector('[data-demo-status]');

  const handleClick = () => {
    status.textContent = 'Complete.';
  };

  button.addEventListener('click', handleClick);

  return () => {
    button.removeEventListener('click', handleClick);
  };
}
```

Cleanup runs when navigation replaces the article. It must clear timers,
observers, subscriptions, document-level listeners, and other resources created
by the controller.

The host receives `data-blog-controller-state="loading"`, `"ready"`, or
`"error"`. Scoped CSS can use these states for progressive enhancement:

```css
.demo[data-blog-controller-state="loading"] .demo__controls {
  opacity: 0.5;
}

.demo[data-blog-controller-state="ready"] .demo__fallback {
  display: none;
}
```

Controllers must be local `.js` or `.mjs` files that exist at generation time.
Relative imports and assets can be resolved from `import.meta.url`.

Design the initial HTML as a meaningful fallback. A controller should enhance
semantic content rather than create the entire explanation from an empty node.

## HTML asset handling and restrictions

Relative paths in native HTML are resolved from the HTML fragment's directory.
The generator rewrites these attributes when they point to post-local files:

- `img[src]`;
- `video[src]` and `video[poster]`;
- `source[src]`;
- `audio[src]`;
- `track[src]`;
- `link[href]`; and
- `a[href]`.

Root-relative paths, fragment links, protocol URLs, and HTTPS URLs are left as
written. Keep authored local paths inside the post asset directory.

The content generator rejects:

- all `iframe` elements;
- all inline or external `script` elements;
- remote controllers;
- controller files outside the post directory;
- missing controller modules; and
- fragment or asset paths that escape the post directory.

These rules keep HTML native to the blog instead of turning it into an
independently embedded application.

## Styling native content

Native content participates in the LMMs-Lab brand-blue theme, which uses
`#03639a` for the paper surface and warm cream text. The screen theme is fixed;
print output switches to an ink-friendly white surface. A4 output uses compact
printer-safe margins and removes the screen canvas width and padding so content
does not receive a second inset. Prefer the semantic site variables:

The screen layout is intentionally flat: the page and content canvas share one
blue surface, with corner marks indicating the content boundary instead of a
filled card, border, or drop shadow. The table of contents uses the same corner
treatment and flat active-section markers. The Giscus discussion area uses the
site-owned `public/giscus.css` theme within matching corner marks and is omitted
from print output. Keep that stylesheet available at `/giscus.css` with its
`https://giscus.app` CORS rule in `public/_headers`. Its stable Roboto, Space
Grotesk, and Google Sans Code webfont assets are copied from the installed
Fontsource packages into `/fonts`; those responses need the same Giscus CORS
rule. The embed references the versioned canonical HTTPS theme asset so the
cross-origin iframe uses the same typography and styling in local previews.

```css
.demo {
  color: var(--text-color);
  background: var(--paper-bg);
  border: 1px solid var(--border-color);
  font-family: var(--font-body);
}

.demo__heading {
  font-family: var(--font-heading);
}

.demo__code {
  font-family: var(--font-mono);
}
```

Frequently useful variables include:

- `--background`, `--paper-bg`, and `--accent-bg`;
- `--text-color` and `--text-secondary`;
- `--link-color` and `--border-color`;
- `--font-body`, `--font-heading`, and `--font-mono`; and
- adapted Catppuccin accent tokens such as `--ctp-blue`, `--ctp-teal`,
  `--ctp-mauve`, `--ctp-peach`, `--ctp-green`, and `--ctp-red`.

The font variables use self-hosted Roboto, Space Grotesk, and Google Sans Code.
Fragments should inherit them instead of loading remote web fonts. Heading and
monospace stacks fall back to the self-hosted Roboto face when a specialized
face is unavailable, so content and controls remain readable.

Use `color-mix()` with theme variables instead of hard-coded light backgrounds.
Check mobile widths, print layout, keyboard focus, reduced motion, and overflow.
Keep selectors under the fragment's unique root class.

## Publishing and validation

Generated TypeScript under `src/app/data/` is ignored. Never edit or commit it.
The source of truth is each `content/posts/<slug>/` directory and its `index.md`
or `index.html`. The online `/docs` page is also generated from this file; do
not create a second copy of the authoring guide in an Angular template.

Run these checks before publishing:

```bash
pnpm generate:data
pnpm test
pnpm biome:check
pnpm build
```

`pnpm start`, `pnpm test`, and `pnpm build` regenerate post data through their
package hooks. Running `generate:data` directly is useful for isolating content
errors.

Review the rendered post at desktop and mobile widths. Check at least:

- the index title, date, and description;
- heading order and table-of-contents labels;
- the fixed brand-blue screen theme and white print theme;
- image alternative text and zoom;
- table and code overflow;
- math rendering;
- controller loading, ready, cleanup, and error behavior; and
- the Giscus section at the canonical post pathname.

## Common failures

| Error or symptom | Likely cause | Resolution |
| --- | --- | --- |
| `Loose post sources are not supported` | A legacy `.md` or `.html` file is directly under `content/posts/`. | Move it to `<slug>/index.md` or `<slug>/index.html`. |
| `must have exactly one source file` | Both `index.md` and `index.html` exist in a post directory, or neither exists. | Keep exactly one index source. |
| Front matter validation fails | YAML is missing or malformed, a field is missing or unknown, or the date is invalid. | Put valid `title`, quoted `date`, and `description` front matter at the very start of the index source. |
| Fragment remains unresolved or generation fails | The fragment is not a local `.html` file or its path is wrong. | Put it under `content/posts/<slug>/` and use a relative path. |
| `Blog controller does not exist` | `data-blog-controller` points to a missing file. | Add the local `.js`/`.mjs` module or correct the relative path. |
| Interactive content shows an error message | The module failed to import or `mount(host)` threw. | Check the browser console and make the initial HTML a useful fallback. |
| Styles affect unrelated article content | Fragment CSS is not scoped. | Prefix every selector with the fragment's unique root class. |
| An image is missing in production | The local path does not resolve under the post asset directory. | Keep the asset under `content/posts/<slug>/` and use the correct relative path. |
| A heading is absent from the contents list | It is not an `h2` or `h3`, or it has no visible text. | Use a level-two or level-three heading with a clear label. |
| Code generation fails for a language | The fence uses an unsupported or misspelled Shiki language ID. | Use a valid Shiki identifier or omit the language for plain text. |

## Maintaining this guide

Treat this file as part of the publishing API. A content feature is not complete
until its author-facing behavior is documented here.

Update this guide whenever a change affects any of the following:

- metadata or the `Post` model;
- Markdown syntax or custom renderers;
- HTML fragment expansion or path rules;
- supported asset types and URL rewriting;
- post typography, media, code, table, or math behavior;
- native controller loading and cleanup;
- table-of-contents generation;
- comments or theme behavior; or
- author validation and deployment commands.

Keep examples executable, prefer one canonical explanation over duplicated
README text, and update or add tests when documenting behavior enforced by the
generator. `pnpm generate:data` rebuilds both post data and the online guide.
