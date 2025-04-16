import { Routes } from '@angular/router';
import { AuthGuard, hasCustomClaim } from '@angular/fire/auth-guard';
import { customLoginRedirect } from '../app/shared/auth/auth-guard';

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
    data: { authGuardPipe: () => customLoginRedirect },
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
      import('./pages/auth/signup/signup.component').then(
        (c) => c.SignupComponent
      ),
  },
  {
    path: 'auth/assign-athlete',
    loadComponent: () =>
      import('./pages/auth/assign-athlete/assign-athlete.component').then(
        (c) => c.AssignAthleteComponent
      ),
    // canActivate: [AuthGuard],
    // data: { authGuardPipe: () => customLoginRedirect },
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
