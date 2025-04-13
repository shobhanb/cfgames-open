import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

export class AuthGuard implements CanActivate {
  auth = inject(AuthService);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    console.log(this.auth.user());
    console.log(this.auth.userName());
    if (this.auth.user()) {
      return true;
    }
    this.auth.redirectURL = state.url;
    const loginPath = this.router.parseUrl('/login');
    return new RedirectCommand(loginPath, { skipLocationChange: true });
  }
}
