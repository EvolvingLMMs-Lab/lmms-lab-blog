# LMMs-Lab Blog

The source for [blog.lmms-lab.com](https://blog.lmms-lab.com), built with
Angular and deployed as a static Cloudflare Worker.

## Development

Development requires Node.js 24.15 or newer within the Node 24 release line and
pnpm 11.20.0. The repository includes an `.nvmrc` and a `packageManager` pin, so
NVM and Corepack can select the matching tools without system-wide installs:

```bash
nvm use
corepack enable
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

Use the canonical [blog authoring guide](docs/authoring.md), also published at
[blog.lmms-lab.com/docs](https://blog.lmms-lab.com/docs). It documents the post
layout and metadata, Markdown extensions, math, code, tables, media, comments,
seamless native HTML fragments, interactive controllers, theming, asset rules,
and the publishing checklist.

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
