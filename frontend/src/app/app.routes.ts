import { Routes } from '@angular/router';
import { userGuard } from './shared/user-auth/user.guard';
import { adminGuard } from './shared/user-auth/admin.guard';

export const routes: Routes = [
  {
    path: 'public',
    loadChildren: () =>
      import('./pages/public/public.routes').then((c) => c.publicRoutes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((c) => c.authRoutes),
  },
  {
    path: 'private',
    loadChildren: () =>
      import('./pages/private/private.routes').then((c) => c.privateRoutes),
    canActivate: [userGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then((c) => c.adminRoutes),
    canActivate: [adminGuard],
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
