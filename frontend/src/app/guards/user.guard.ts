import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import { map } from 'rxjs';

export const userGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    map((firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        return true;
      }
      return router.createUrlTree(['/home']);
    })
  );
};
