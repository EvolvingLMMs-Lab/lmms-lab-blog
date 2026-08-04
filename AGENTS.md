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
- Angular-authored images should use `app-image-lightbox`, which wraps
  `NgOptimizedImage` and `medium-zoom`.
- Markdown-generated post images are hydrated into `app-image-lightbox`
  instances. Keep generated image HTML dimensioned whenever possible.

## Content

- Blog posts live under `content/posts`.
- Each post has matching metadata at `content/config/<slug>.json` and exactly
  one source at `content/posts/<slug>.md` or `content/posts/<slug>.html`.
- Post-local assets live under `content/posts/<slug>/` and use relative paths
  from the Markdown file.
- Add an AI summary image button beside a heading with
  `<ai-img>relative-image.avif</ai-img>`.
- Add native interactive content with a post-local `<html-fragment>` and a local
  `data-blog-controller` module. Scope fragment CSS to the component, return a
  cleanup function from `mount(host)`, and never use iframes or inline scripts.
- Convert post images to AVIF before committing them.
- The `prebuild`, `prestart`, and `pretest` hooks regenerate post data.
- Files under `src/app/data` are generated and ignored by Git. Edit source
  content rather than generated TypeScript files.
