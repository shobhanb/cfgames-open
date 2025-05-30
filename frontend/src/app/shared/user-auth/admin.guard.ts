import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserAuthService } from './user-auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userAuth = inject(UserAuthService);
  if (userAuth.loggedIn() && userAuth.user()?.is_superuser) {
    return true;
  }
  return false;
};
