import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  apiBearerResponse,
  apiBodyAuthDbLoginAuthLoginPost,
  apiBodyResetForgotPasswordAuthForgotPasswordPost,
  apiBodyResetResetPasswordAuthResetPasswordPost,
  apiBodyVerifyRequestTokenAuthRequestVerifyTokenPost,
  apiBodyVerifyVerifyAuthVerifyPost,
  apiUserCreate,
  apiUserRead,
  apiUserUpdate,
} from '../../api/models';
import { apiAuthService } from '../../api/services';
import { StrictHttpResponse } from '../../api/strict-http-response';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private apiAuth = inject(apiAuthService);
  private toastService = inject(ToastService);

  user = signal<apiUserRead | null>(null);
  token = signal<apiBearerResponse | null>(null);
  loggedIn = computed<boolean>(() => !!this.user() && !!this.token());

  userNameInitials = computed<string | null>(
    () =>
      this.user()
        ?.name.split(' ')
        .map((n) => n[0])
        .join('') || null
  );

  loginWithEmailAndPassword(loginInfo: apiBodyAuthDbLoginAuthLoginPost) {
    this.apiAuth
      .authDbLoginAuthLoginPost$Response({
        body: loginInfo,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiBearerResponse>) => {
          this.token.set(response.body);
          this.toastService.showSuccess('Logged in', '/home');

          if (!this.user()) {
            this.getMyInfo();
          }
        },
        error: (err: any) => {
          console.log('Error during LoginWithEmailAndPassword', err);
          this.token.set(null);
        },
      });
  }

  logout() {
    this.apiAuth.authDbLogoutAuthLogoutPost$Response().subscribe({
      next: () => {
        console.log('Logged out');
        this.user.set(null);
        this.token.set(null);
      },
      error: (err: any) => {
        console.log('Error during Logout', err);
      },
    });
  }

  sendVerificationEmail(
    userInfo: apiBodyVerifyRequestTokenAuthRequestVerifyTokenPost
  ) {
    this.apiAuth
      .verifyRequestTokenAuthRequestVerifyTokenPost$Response({
        body: userInfo,
      })
      .subscribe({
        next: () => {
          console.log('Sent verification email');
        },
        error: (err: any) => {
          console.log('Error during sendVerificationEmail', err);
        },
      });
  }

  verifyEmail(tokenData: apiBodyVerifyVerifyAuthVerifyPost) {
    this.apiAuth
      .verifyVerifyAuthVerifyPost$Response({
        body: tokenData,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiUserRead>) => {
          this.user.set(response.body);
        },
        error: (err: any) => {
          console.log('Error during verifyEmail', err);
          this.user.set(null);
        },
      });
  }

  sendForgotPasswordEmail(
    userInfo: apiBodyResetForgotPasswordAuthForgotPasswordPost
  ) {
    this.apiAuth
      .resetForgotPasswordAuthForgotPasswordPost$Response({
        body: userInfo,
      })
      .subscribe({
        next: () => {
          console.log('Sent forgot password email');
        },
        error: (err: any) => {
          console.log('Error during sendForgotPasswordEmail', err);
        },
      });
  }

  resetPassword(data: apiBodyResetResetPasswordAuthResetPasswordPost) {
    this.apiAuth
      .resetResetPasswordAuthResetPasswordPost$Response({
        body: data,
      })
      .subscribe({
        next: () => {
          console.log('Password changed successfully');
        },
        error: (err: any) => {
          console.log('Error during resetPassword', err);
        },
      });
  }

  getMyInfo() {
    this.apiAuth.usersCurrentUserAuthMeGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiUserRead>) => {
        this.user.set(response.body);
      },
      error: (err: any) => {
        console.log('Error during getMyInfo', err);
        this.user.set(null);
      },
    });
  }

  updateMyInfo(userInfo: apiUserUpdate) {
    this.apiAuth
      .usersPatchCurrentUserAuthMePatch$Response({ body: userInfo })
      .subscribe({
        next: (response: StrictHttpResponse<apiUserRead>) => {
          this.user.set(response.body);
        },
        error: (err: any) => {
          console.log('Error during updateMyInfo', err);
          this.user.set(null);
        },
      });
  }

  constructor() {
    effect(() => {
      if (this.user() && !this.token()) {
        this.getMyInfo();
      }
    });
  }
}
