import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const judgeUserGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.verifiedUser() && authService.athlete()?.judge) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
