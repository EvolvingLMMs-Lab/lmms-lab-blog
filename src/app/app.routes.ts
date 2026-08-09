import { Routes } from '@angular/router';

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
        data: { kind: 'posts' },
        loadComponent: () =>
          import('./pages/archive/archive').then((module) => module.ArchiveComponent),
      },
      {
        path: 'notes',
        data: { kind: 'notes' },
        loadComponent: () =>
          import('./pages/archive/archive').then((module) => module.ArchiveComponent),
      },
      {
        path: 'posts/:slug',
        data: { legacyKind: 'posts' },
        loadComponent: () =>
          import('./pages/site-post/site-post').then((module) => module.SitePostComponent),
      },
      {
        path: 'notes/:slug',
        data: { legacyKind: 'notes' },
        loadComponent: () =>
          import('./pages/site-post/site-post').then((module) => module.SitePostComponent),
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
