import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { CanActivateFn } from '@angular/router';

export const userGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);

  if (auth.currentUser && auth.currentUser.emailVerified) {
    return true;
  }
  return false;
};
