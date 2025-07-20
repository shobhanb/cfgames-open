import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const user = authService.user();
  const customClaims = authService.userCustomClaims();

  if (!!user && user.emailVerified && !!customClaims && customClaims.admin) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
