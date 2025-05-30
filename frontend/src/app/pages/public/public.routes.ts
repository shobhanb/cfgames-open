import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./leaderboard/leaderboard.component').then(
        (c) => c.LeaderboardComponent
      ),
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./team/team.component').then((c) => c.TeamComponent),
  },
  {
    path: 'scores',
    loadComponent: () =>
      import('./scores/scores.component').then((c) => c.ScoresComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
