import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  // getIdToken() returns a Promise<string|null>
  return from(
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)
  ).pipe(
    switchMap((token) => {
      if (token) {
        const authRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(authRequest);
      }
      return next(req);
    })
  );
};
