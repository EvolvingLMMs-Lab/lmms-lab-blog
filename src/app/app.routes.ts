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
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((module) => module.NotFoundComponent),
  },
];
