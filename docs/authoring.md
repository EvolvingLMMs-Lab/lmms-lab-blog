# Blog authoring guide

This is the canonical reference for writing content for the LMMs-Lab Blog.
When the publishing pipeline gains, removes, or changes an author-facing
feature, update this guide in the same change.

## Quick start

Every post has one metadata file, one content source, and an optional asset
directory:

```text
content/
├── config/
│   └── my-post.json
└── posts/
    ├── my-post.md
    └── my-post/
        ├── cover.avif
        ├── result.avif
        └── interactive/
            ├── demo.css
            └── demo.mjs
```

Use a lowercase kebab-case slug such as `my-post`. Create exactly one content
source:

- `content/posts/<slug>.md` for a Markdown-first article; or
- `content/posts/<slug>.html` for an HTML-first article.

Markdown is the recommended default. It can alternate seamlessly with raw HTML
and post-local HTML fragments, so choosing Markdown does not limit interactive
or highly designed sections.

Start the development server with:

```bash
pnpm start
```

The post is available at `http://localhost:4200/<slug>`.

## Metadata

Create `content/config/<slug>.json`:

```json
{
  "title": "A descriptive post title",
  "date": "2026-08-04",
  "description": "A concise summary used on the blog index.",
  "coverImage": "/posts/my-post/cover.avif"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Displayed as the article title and on the blog index. |
| `date` | Yes | Use `YYYY-MM-DD`. Posts are sorted newest first. |
| `description` | Yes | Keep it short enough to scan on the index page. |
| `coverImage` | No | Use a published root-relative path, normally `/posts/<slug>/cover.avif`. A 16:9 image works best in the index card. |

Do not add the title as an `h1` in the content source. The blog shell already
renders the title, date, and cover image.

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

Fenced code blocks are highlighted with Shiki, use Catppuccin Latte and Mocha
for light and dark mode, show the language, and include a copy button:

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

MathJax typesets both forms after the article is mounted. Display equations are
centered and become horizontally scrollable when necessary.

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

Use meaningful alternative text. Prefer AVIF for committed article images and
cover images unless the source format has a specific technical purpose.

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

Use semantic HTML for media that Markdown does not express directly:

```html
<video controls muted playsinline preload="metadata" aria-label="Pipeline comparison">
  <source src="./pipeline.webm" type="video/webm">
  Your browser does not support WebM video.
</video>
```

Post-local `video`, `audio`, `source`, `track`, and video `poster` paths are
rewritten to their published `/posts/<slug>/...` URLs. HTTPS media URLs remain
external.

### Comments

Giscus comments are appended automatically to every valid post. Authors should
not add a Giscus script to article content. The blog maps discussions by
pathname and keeps the Giscus theme synchronized with the site theme.

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

For an HTML-first article, create `content/posts/<slug>.html` instead of the
Markdown file. Write article body content only; do not include `<!doctype>`,
`<html>`, or a duplicate page title.

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

Native content participates in both Catppuccin themes. Prefer the semantic site
variables:

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
- Catppuccin accents such as `--ctp-blue`, `--ctp-teal`, `--ctp-mauve`,
  `--ctp-peach`, `--ctp-green`, and `--ctp-red`.

Use `color-mix()` with theme variables instead of hard-coded light backgrounds.
Check light and dark mode, mobile widths, print layout, keyboard focus, reduced
motion, and overflow. Keep selectors under the fragment's unique root class.

## Publishing and validation

Generated TypeScript under `src/app/data/` is ignored. Never edit or commit it.
The source of truth is always `content/config/`, `content/posts/`, and post-local
assets.

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

- the index title, date, description, and cover crop;
- heading order and table-of-contents labels;
- light and dark mode;
- image alternative text and zoom;
- table and code overflow;
- math rendering;
- controller loading, ready, cleanup, and error behavior; and
- the Giscus section at the canonical post pathname.

## Common failures

| Error or symptom | Likely cause | Resolution |
| --- | --- | --- |
| `must have exactly one source file` | Both `<slug>.md` and `<slug>.html` exist, or neither exists. | Keep exactly one content source. |
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
generator.
