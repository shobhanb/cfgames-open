import {
  AuthPipe,
  hasCustomClaim,
  customClaims,
  loggedIn,
} from '@angular/fire/auth-guard';
import { User } from 'firebase/auth';
import { forkJoin, map, Observable, of, pipe, switchMap } from 'rxjs';

const combineAuthPipes = (authPipes: AuthPipe[]) =>
  switchMap((t: Observable<User>) => forkJoin(authPipes.map((x) => x(t))));

export const customLoginRedirect = pipe(
  map((t: User) => of(t)),
  combineAuthPipes([
    loggedIn,
    customClaims as AuthPipe,
    hasCustomClaim('athleteId'),
  ]),
  map(([isLoggedIn, customClaimList, hasAthleteId]) => {
    return {
      loggedIn: isLoggedIn,
      customClaims: customClaimList,
      hasAthleteId,
    };
  }),
  map((t) => {
    if (t.hasAthleteId) {
      return true;
    }
    if (t.loggedIn && !t.hasAthleteId) {
      return ['/auth/assign-athlete'];
    }
    if (!t.loggedIn) {
      return ['/auth'];
    }
    return ['/home'];
  })
);
