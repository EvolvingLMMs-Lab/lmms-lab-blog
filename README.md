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

Use the canonical [blog authoring guide](docs/authoring.md). It documents the
post layout and metadata, Markdown extensions, math, code, tables, media,
comments, seamless native HTML fragments, interactive controllers, theming,
asset rules, and the publishing checklist.

Keep author-facing behavior in that guide rather than duplicating it here. Any
publishing feature change must update the guide in the same change.

## Deployment

`wrangler.jsonc` maps the Worker to the custom domain. After authenticating
Wrangler with the LMMs-Lab Cloudflare account, deploy with:

```bash
pnpm deploy
```

The `lmms-lab.com` zone must be active in that Cloudflare account, and an
existing DNS record for `blog.lmms-lab.com` must not conflict with the Worker
custom domain.
