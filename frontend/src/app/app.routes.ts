import { Routes } from '@angular/router';

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
    redirectTo: '/leaderboard',
    pathMatch: 'full',
  },
];
