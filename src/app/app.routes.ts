import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/blog-shell/blog-shell').then(m => m.BlogShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'docs',
        loadComponent: () => import('./pages/docs/docs').then(m => m.DocsComponent),
      },
      {
        path: ':slug',
        loadComponent: () => import('./pages/post/post').then(m => m.PostComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
      },
    ],
  },
];
