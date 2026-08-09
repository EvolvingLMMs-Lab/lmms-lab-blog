# LMMs-Lab Website

The integrated [LMMs-Lab](https://www.lmms-lab.com) website and research blog,
deployed as one static site on Cloudflare Workers. The original Next.js site is
kept intact for the lab pages, while the Angular publishing system lives under
`/blog`.

The public route layout is:

- `/`: original lab homepage (`/home` redirects here);
- `/about`: original lab About page;
- `/posts` and `/posts/<slug>`: original publication archive and pages;
- `/notes` and `/notes/<slug>`: original field-note archive and pages;
- `/onevision-encoder`: original standalone research page;
- `/blog`: publication index;
- `/blog/<slug>`: publication pages; and
- `/blog/docs`: authoring documentation.

The production build first builds both applications and then overlays the
legacy static export from `legacy-site` at the root. It merges both sitemaps
without replacing the Angular output under `/blog`.

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

`pnpm start` builds both applications and serves the exact composed site at
<http://localhost:4200>. Use `pnpm start:blog` or `pnpm start:legacy` when
working on one application with its framework development server, and use
`pnpm preview` to serve an existing composed build without rebuilding it.

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

## Legacy source and content import

`legacy-site` is a source-preserving copy of
[`Luodian/lmms-lab-website`](https://github.com/Luodian/lmms-lab-website) at
commit `61adff1`. Its React components, routes, transitions, responsive styles,
and public assets are built without an Angular reimplementation so the lab
pages remain identical to the original site.

The only local changes to that source are static-hosting and hydration fixes
that preserve its rendered design: deterministic ordering for same-day notes,
publishing note-local images, and full-document navigation for raw HTML pages.

The same content is also normalized into the Angular blog's directory-based
Markdown format by a resumable importer:

```bash
node scripts/import-legacy-site.mjs /path/to/lmms-lab-website
node scripts/vendor-legacy-media.mjs
```

It converts supported MDX components, repairs the malformed multiline BibTeX
found in historical front matter, and converts web images to AVIF and GIFs to
WebM. The second, resumable pass vendors research figures from legacy
third-party image hosts; dynamic Shields badges intentionally remain external.

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
