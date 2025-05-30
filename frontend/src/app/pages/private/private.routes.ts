import { Routes } from '@angular/router';

export const privateRoutes: Routes = [
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./scheduling/scheduling.component').then(
        (c) => c.SchedulingComponent
      ),
  },
  {
    path: 'appreciation',
    loadComponent: () =>
      import('./appreciation/appreciation.component').then(
        (c) => c.AppreciationComponent
      ),
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
