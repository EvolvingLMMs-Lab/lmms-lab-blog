# LMMs-Lab Website

The integrated [LMMs-Lab](https://www.lmms-lab.com) website and research blog,
built with Angular and deployed as static assets on Cloudflare Workers.

The public route layout is:

- `/` and `/home`: lab homepage;
- `/about`: lab manifesto and projects;
- `/blog`: publication index;
- `/blog/<slug>`: publication pages; and
- `/blog/docs`: authoring documentation.

Legacy `/posts/...`, `/notes/...`, `/docs`, and standalone-blog article URLs are
redirected to the new route layout.

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
[www.lmms-lab.com/blog/docs](https://www.lmms-lab.com/blog/docs). It documents
the post layout and metadata, Markdown extensions, math, code, tables, media,
comments, native HTML fragments, interactive controllers, theming, asset rules,
and the publishing checklist.

Keep author-facing behavior in that guide rather than duplicating it here. Any
publishing feature change must update the guide in the same change.

## Legacy content import

The old Next.js repository is normalized into this repository's directory-based
Markdown format by a resumable importer:

```bash
node scripts/import-legacy-site.mjs /path/to/lmms-lab-website
node scripts/vendor-legacy-media.mjs
```

It converts supported MDX components, repairs the malformed multiline BibTeX
found in historical front matter, converts web images to AVIF and GIFs to WebM,
and imports only the homepage assets used by this implementation. The second,
resumable pass vendors research figures from legacy third-party image hosts;
dynamic Shields badges intentionally remain external.

## Deployment

Deployment is intentionally staged. The default command keeps the preview
custom domain at `blog.lmms-lab.com`:

```bash
pnpm deploy
```

After the integrated site has been accepted on the preview domain, deploy the
separate production Worker to `www.lmms-lab.com` with:

```bash
pnpm deploy:production
```

Before the production cutover, remove any DNS record for `www.lmms-lab.com`
that conflicts with the Worker custom domain. Keep the existing apex
`lmms-lab.com` redirect pointed at the canonical `www` host. Do not run either
deployment command unless a live deployment is explicitly intended.
