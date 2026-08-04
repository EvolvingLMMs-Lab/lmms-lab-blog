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
- `content/posts/<slug>.md`

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

### Embedded web experiences

Use the blog's `web-embed` element for interactive demos and external pages:

```html
<web-embed
  src="https://example.com/demo/"
  title="Interactive demo"
  caption="Explore the full interactive result without leaving the article."
  height="680"
  wide
></web-embed>
```

The generated embed includes lazy loading, a sandbox, reload and fullscreen
controls, an external-page fallback, and responsive/print styles. `src` must be
HTTPS or root-relative. `height` is clamped between 360 and 1200 pixels; add
`wide` when the experience benefits from extending beyond the text column.

## Deployment

`wrangler.jsonc` maps the Worker to the custom domain. After authenticating
Wrangler with the LMMs-Lab Cloudflare account, deploy with:

```bash
pnpm deploy
```

The `lmms-lab.com` zone must be active in that Cloudflare account, and an
existing DNS record for `blog.lmms-lab.com` must not conflict with the Worker
custom domain.
