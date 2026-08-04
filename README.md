# LMMs-Lab Blog

The source for [blog.lmms-lab.com](https://blog.lmms-lab.com), built with
Angular and deployed as a static Cloudflare Worker.

## Development

Install dependencies and start the local server:

```bash
pnpm install
pnpm start
```

The site is available at <http://localhost:4200>.

Useful checks:

```bash
pnpm test
pnpm biome:check
pnpm build
```

## Writing a post

Create matching files for the post slug:

- `content/config/<slug>.json`
- `content/posts/<slug>.md` or `content/posts/<slug>.html`

Metadata uses this shape:

```json
{
  "title": "Post title",
  "date": "2026-08-04",
  "description": "A short summary shown on the index page."
}
```

Optional post assets belong in `content/posts/<slug>/` and can be referenced
with relative Markdown paths. Generated TypeScript under `src/app/data` should
not be edited or committed.

### Native HTML experiences

Posts can be authored directly as HTML, or a Markdown post can include a local
HTML fragment. Fragments are inserted into the article DOM at build time, so
they inherit the blog theme and never use an iframe:

```html
<html-fragment src="./interactive.html"></html-fragment>
```

Without `wide`, the fragment's HTML nodes replace `<html-fragment>` directly
and become siblings of the surrounding Markdown output—there is no runtime
wrapper or embedded document. This makes it natural to alternate Markdown and
HTML sections. Raw HTML can also be written directly in a Markdown file when a
separate fragment is unnecessary. `wide` adds a transparent layout wrapper only
for visualizations that need to extend beyond the reading column. Post-local
stylesheets referenced by a fragment are inlined during generation, so their
rules participate in the same document cascade without a runtime stylesheet
request.

Keep fragment styles scoped to a unique component class. For interactivity,
point `data-blog-controller` to a post-local JavaScript module:

```html
<section class="demo" data-blog-controller="./interactive/controller.mjs">
  <!-- Native semantic HTML remains useful before the module loads. -->
</section>
```

```js
export function mount(host) {
  const handleClick = () => {};
  host.addEventListener('click', handleClick);
  return () => host.removeEventListener('click', handleClick);
}
```

The module is mounted after the article renders and its cleanup function runs
when navigation replaces the post. Fragment sources, assets, and controllers
must stay inside `content/posts/<slug>/`. Inline scripts and iframes are rejected
during content generation.

## Deployment

`wrangler.jsonc` maps the Worker to the custom domain. After authenticating
Wrangler with the LMMs-Lab Cloudflare account, deploy with:

```bash
pnpm deploy
```

The `lmms-lab.com` zone must be active in that Cloudflare account, and an
existing DNS record for `blog.lmms-lab.com` must not conflict with the Worker
custom domain.
