import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
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
  { path: 'onevision-encoder', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
