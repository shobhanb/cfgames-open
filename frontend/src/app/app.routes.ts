import { Routes } from '@angular/router';

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
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/landing/landing.component').then(
        (c) => c.LandingComponent
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./pages/auth/signup-assign/signup-assign.component').then(
        (c) => c.SignupAssignComponent
      ),
  },
  {
    path: 'auth/not-verified',
    loadComponent: () =>
      import('./pages/auth/not-verified/not-verified.component').then(
        (c) => c.NotVerifiedComponent
      ),
  },
  {
    path: 'auth/verify/:token',
    loadComponent: () =>
      import('./pages/auth/verify/verify.component').then(
        (c) => c.VerifyComponent
      ),
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
