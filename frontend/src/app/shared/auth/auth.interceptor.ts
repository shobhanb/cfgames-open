import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!!auth.user()) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${auth.user()!.getIdToken()}`,
      },
    });
    return next(authReq);
  }
  return next(req);
};
