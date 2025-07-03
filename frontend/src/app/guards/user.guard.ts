import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, User, user } from '@angular/fire/auth';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return user(auth).pipe(
    map((firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        return true;
      }
      return router.createUrlTree(['/home']);
    })
  );
};
