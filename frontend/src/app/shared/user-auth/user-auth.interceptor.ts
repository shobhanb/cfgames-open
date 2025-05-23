import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserAuthService } from './user-auth.service';

export const userAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const userAuthService = inject(UserAuthService);
  const token = userAuthService.token();
  const bearerToken = token?.access_token;

  if (bearerToken) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return next(authRequest);
  }

  return next(req);
};
