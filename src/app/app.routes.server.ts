import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { POSTS } from './data/posts';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
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
  { path: 'posts/:slug', renderMode: RenderMode.Client },
  { path: 'notes/:slug', renderMode: RenderMode.Client },
  { path: ':slug', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
