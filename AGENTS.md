# AGENTS.md

Project guidance for agents working in this repository.

## Version Control

- Use Git for all version-control workflows in this repository.
- Check state with `git status` and inspect changes with `git diff`.
- Do not use Jujutsu (`jj`) unless the user explicitly requests it.

## Development

- Use `pnpm` for package scripts and dependency management.
- Generate derived post data with `pnpm generate:data`.
- Start the local development server with `pnpm start`.
- Build with `pnpm build`.
- Run unit tests with `pnpm test`.
- Run formatting and lint checks with `pnpm biome:check`.
- Apply automatic Biome fixes with `pnpm biome:write`.
- Deploy the built site with `pnpm deploy` only when explicitly requested.

## Design

- Follow the existing Catppuccin palette and reuse its CSS variables.
- Treat `legacy-site` as the visual and behavioral source of truth for `/`,
  `/about`, `/posts`, `/notes`, and `/onevision-encoder`; do not approximate
  those pages in Angular. Angular owns only `/blog`, and cross-application
  links must use full-document navigation rather than Angular `routerLink`.
- Angular-authored images should use `app-image-lightbox`, which wraps
  `NgOptimizedImage` and `medium-zoom`.
- Markdown-generated post images are hydrated into `app-image-lightbox`
  instances. Keep generated image HTML dimensioned whenever possible.

## Content

- Blog posts live under `content/posts`.
- Each post is a self-contained `content/posts/<slug>/` directory with exactly
  one `index.md` or `index.html` source. The directory name is the post slug.
- Put `title`, `date`, and `description` in YAML front matter at the start of
  the index source. Keep post-local assets beside it and use relative paths.
- Add an AI summary image button beside a heading with
  `<ai-img>relative-image.avif</ai-img>`.
- Add native interactive content with a post-local `<html-fragment>` and a local
  `data-blog-controller` module. Scope fragment CSS to the component, return a
  cleanup function from `mount(host)`, and never use iframes or inline scripts.
  Default fragments expand directly into the Markdown document flow; use
  `wide` only when a transparent breakout wrapper is genuinely necessary.
- Convert post images to AVIF before committing them.
- The `prebuild`, `prestart`, and `pretest` hooks regenerate post data.
- Files under `src/app/data` are generated and ignored by Git. Edit source
  content rather than generated TypeScript files.

## Documentation

- `docs/authoring.md` is the canonical author-facing reference for the blog's
  publishing API. Keep the README concise and link to that guide instead of
  duplicating authoring instructions.
- Update `docs/authoring.md` in the same change whenever behavior affecting
  metadata, Markdown or HTML rendering, fragments, asset paths, interactive
  controllers, the table of contents, typography, media, math, code, tables,
  comments, themes, or validation commands changes.
- A publishing feature is not complete until its guide text, executable
  examples, and relevant tests agree with the implementation.
