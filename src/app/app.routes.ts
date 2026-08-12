import { inject } from '@angular/core';
import { Router, type RedirectFunction, type Routes } from '@angular/router';
import { legacyBlogPath } from './config/legacy-routes';

const redirectToBlog: RedirectFunction = ({ queryParams, fragment }) =>
  inject(Router).createUrlTree(['/blog'], { queryParams, fragment: fragment ?? undefined });

const redirectLegacyArticle: RedirectFunction = ({ data, params, queryParams, fragment }) => {
  const kind = data['legacyKind'];
  const slug = params['slug'];
  const path =
    (kind === 'posts' || kind === 'notes') && typeof slug === 'string'
      ? legacyBlogPath(slug, kind)
      : '/blog';
  return inject(Router).createUrlTree([path], {
    queryParams,
    fragment: fragment ?? undefined,
  });
};

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
      {
        path: 'posts',
        redirectTo: redirectToBlog,
      },
      {
        path: 'notes',
        redirectTo: redirectToBlog,
      },
      {
        path: 'posts/:slug',
        data: { legacyKind: 'posts' },
        redirectTo: redirectLegacyArticle,
      },
      {
        path: 'notes/:slug',
        data: { legacyKind: 'notes' },
        redirectTo: redirectLegacyArticle,
      },
      {
        path: 'onevision-encoder',
        data: {
          articleSlug: 'onevision-encoder',
          canonicalPath: '/onevision-encoder',
          legacyKind: 'posts',
        },
        loadComponent: () =>
          import('./pages/site-post/site-post').then((module) => module.SitePostComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found').then((module) => module.NotFoundComponent),
      },
    ],
  },
];
