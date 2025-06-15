import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserAuthService } from './user-auth.service';

export const userGuard: CanActivateFn = (route, state) => {
  const userAuth = inject(UserAuthService);
  const router = inject(Router);

  if (userAuth.loggedIn() && userAuth.user()?.is_verified) {
    return true;
  }
  return router.createUrlTree(['/auth', 'not-verified']);
};
