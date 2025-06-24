import { Routes } from '@angular/router';
import { userGuard } from '../../shared/user-auth/user.guard';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((c) => c.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup-assign/signup-assign.component').then(
        (c) => c.SignupAssignComponent
      ),
  },
  {
    path: 'verify/:token',
    loadComponent: () =>
      import('./verify/verify.component').then((c) => c.VerifyComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
  },
  {
    path: 'not-verified',
    loadComponent: () =>
      import('./not-verified/not-verified.component').then(
        (c) => c.NotVerifiedComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/public/home',
    pathMatch: 'full',
  },
];
