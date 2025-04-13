import { Routes } from '@angular/router';
import { AuthGuard } from './shared/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard.component').then(
        (c) => c.LeaderboardComponent
      ),
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./pages/team/team.component').then((c) => c.TeamComponent),
  },
  {
    path: 'scores',
    loadComponent: () =>
      import('./pages/scores/scores.component').then((c) => c.ScoresComponent),
  },
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./pages/scheduling/scheduling.component').then(
        (c) => c.SchedulingComponent
      ),
    canActivate: [AuthGuard],
    providers: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
