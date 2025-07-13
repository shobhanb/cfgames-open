import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import { customClaims } from '@angular/fire/auth-guard';
import { switchMap, map, of } from 'rxjs';

function isParsedToken(
  claims: unknown
): claims is { admin?: boolean; email_verified?: boolean } {
  return !!claims && typeof claims === 'object' && !Array.isArray(claims);
}

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return authState(auth).pipe(
    switchMap((firebaseUser: User | null) => {
      if (!firebaseUser) return of(false);
      return customClaims(of(firebaseUser)).pipe(
        map((claims) => {
          if (isParsedToken(claims)) {
            return !!claims.admin && !!claims.email_verified;
          }
          return router.createUrlTree(['/home']);
        })
      );
    })
  );
};
