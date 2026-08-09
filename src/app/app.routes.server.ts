import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { LEGACY_NOTE_ROUTES, LEGACY_POST_ROUTES } from './config/legacy-routes';
import { POSTS } from './data/posts';

export const serverRoutes: ServerRoute[] = [
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'blog/docs', renderMode: RenderMode.Prerender },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return POSTS.map((post) => ({ slug: post.slug }));
    },
  },
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'posts', renderMode: RenderMode.Prerender },
  { path: 'notes', renderMode: RenderMode.Prerender },
  { path: 'onevision-encoder', renderMode: RenderMode.Prerender },
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return LEGACY_POST_ROUTES.map((route) => ({ slug: route.legacySlug }));
    },
  },
  {
    path: 'notes/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return LEGACY_NOTE_ROUTES.map((route) => ({ slug: route.legacySlug }));
    },
  },
  { path: '**', renderMode: RenderMode.Client },
];
