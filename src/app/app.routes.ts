import { Routes } from '@angular/router';
import { POSTS } from './data/posts';
import { normalizeLegacySlug } from './config/site';

const previousBlogRoutes: Routes = POSTS.map((post) => ({
  path: post.slug,
  redirectTo: `/blog/${post.slug}`,
  pathMatch: 'full',
}));

export const routes: Routes = [
  {
    path: 'blog',
    loadComponent: () =>
      import('./components/blog-shell/blog-shell').then((module) => module.BlogShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((module) => module.HomeComponent),
      },
      {
        path: 'docs',
        loadComponent: () => import('./pages/docs/docs').then((module) => module.DocsComponent),
      },
      {
        path: ':slug',
        loadComponent: () => import('./pages/post/post').then((module) => module.PostComponent),
      },
    ],
  },
  {
    path: 'posts',
    pathMatch: 'full',
    redirectTo: '/blog',
  },
  {
    path: 'posts/:slug',
    redirectTo: ({ params }) => `/blog/${normalizeLegacySlug(params['slug'])}`,
  },
  {
    path: 'notes',
    pathMatch: 'full',
    redirectTo: '/blog',
  },
  {
    path: 'notes/dllm',
    redirectTo: '/blog/diffusion-language-models',
  },
  {
    path: 'notes/wake-up',
    redirectTo: '/blog/digital-tide',
  },
  {
    path: 'docs',
    redirectTo: '/blog/docs',
  },
  ...previousBlogRoutes,
  {
    path: '',
    loadComponent: () =>
      import('./components/site-shell/site-shell').then((module) => module.SiteShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/lab-home/lab-home').then((module) => module.LabHomeComponent),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/lab-home/lab-home').then((module) => module.LabHomeComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((module) => module.AboutComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((module) => module.NotFoundComponent),
  },
];
