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

## Deployment

`wrangler.jsonc` maps the Worker to the custom domain. After authenticating
Wrangler with the LMMs-Lab Cloudflare account, deploy with:

```bash
pnpm deploy
```

The `lmms-lab.com` zone must be active in that Cloudflare account, and an
existing DNS record for `blog.lmms-lab.com` must not conflict with the Worker
custom domain.
