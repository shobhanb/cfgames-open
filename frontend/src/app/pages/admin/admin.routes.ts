import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'athletes',
    loadComponent: () =>
      import('./athletes/athletes.component').then((c) => c.AthletesComponent),
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./teams/teams.component').then((c) => c.TeamsComponent),
  },
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./scheduling/scheduling.component').then(
        (c) => c.SchedulingComponent
      ),
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./attendance/attendance.component').then(
        (c) => c.AttendanceComponent
      ),
  },
  {
    path: 'sidescores',
    loadComponent: () =>
      import('./sidescores/sidescores.component').then(
        (c) => c.SidescoresComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/public/home',
    pathMatch: 'full',
  },
];
