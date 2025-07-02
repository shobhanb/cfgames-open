import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'public',
    loadChildren: () =>
      import('./pages/public/public.routes').then((c) => c.publicRoutes),
  },
  {
    path: 'private',
    loadChildren: () =>
      import('./pages/private/private.routes').then((c) => c.privateRoutes),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then((c) => c.adminRoutes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((c) => c.authRoutes),
  },
  {
    path: '**',
    redirectTo: '/public/home',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: '/public/home',
    pathMatch: 'full',
  },
];
