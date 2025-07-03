import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((c) => c.tabsRoutes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((c) => c.authRoutes),
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
