import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '**',
    redirectTo: '/public/home',
    pathMatch: 'full',
  },
];
