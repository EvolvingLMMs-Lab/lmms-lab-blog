# LMMs-Lab Website

The integrated [LMMs-Lab](https://www.lmms-lab.com) website and research blog,
implemented as one native Angular application and deployed as a static site on
Cloudflare Workers. The lab pages and the publishing system share one router,
while retaining distinct shells for their established visual identities.

The public route layout is:

- `/` and `/home`: lab homepage;
- `/about`: lab About page;
- `/onevision-encoder`: standalone research URL;
- `/blog`: unified publication and field-note index;
- `/blog/<slug>`: publication pages; and
- `/blog/docs`: authoring documentation.

Historical `/posts`, `/notes`, `/posts/<slug>`, and `/notes/<slug>` URLs are
permanent redirects to their canonical `/blog` destinations. Query strings and
fragments are preserved.

Every route above is rendered by Angular and prerendered by the same production
build. There is no secondary React/Next.js runtime or composed static export.

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

`pnpm start` runs the Angular development server at <http://localhost:4200>.
After `pnpm build`, use `pnpm preview` to serve the static Cloudflare output.

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

Historical content from
[`Luodian/lmms-lab-website`](https://github.com/Luodian/lmms-lab-website) can be
normalized into the Angular blog's directory-based Markdown format by the
resumable importer:

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
