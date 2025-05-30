import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  apiAthleteDetail,
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
import { apiAthleteService, apiAuthService } from '../../api/services';
import { StrictHttpResponse } from '../../api/strict-http-response';
import { ToastService } from '../toast/toast.service';
import { ModalService } from '../modal/modal.service';
import { apiErrorMap } from '../error-mapping';
import { ScoreFilterService } from '../score-filter/score-filter.service';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private apiAuth = inject(apiAuthService);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private apiAthlete = inject(apiAthleteService);

  user = signal<apiUserRead | null>(null);
  token = signal<apiBearerResponse | null>(null);
  loggedIn = computed<boolean>(() => !!this.user() && !!this.token());
  athlete = signal<apiAthleteDetail | null>(null);

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
          this.getMyInfo();
          localStorage.setItem('cfgames-token', JSON.stringify(response.body));
          this.toastService.showSuccess('Logged in', '/home');
        },
        error: (err: any) => {
          console.log('Error during login', err);
          const detail: string = String(err?.error?.detail ?? '');
          const friendlyMsg = apiErrorMap[detail] || detail;
          this.modalService.show('No Rep!', friendlyMsg, '/home');
        },
      });
  }

  logout() {
    this.apiAuth.authDbLogoutAuthLogoutPost$Response().subscribe({
      next: () => {
        console.log('Logged out');
        this.user.set(null);
        this.token.set(null);
        localStorage.removeItem('cfgames-token');
        this.toastService.showSuccess('Logged out', '/home', 500);
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
          this.modalService.show(
            'Rep!',
            'Password reset successfully. Please login with the new password',
            '/auth/login'
          );
        },
        error: (err: any) => {
          console.log('Error during resetPassword', err);
          const detail: string = String(err?.error?.detail ?? '');
          const friendlyMsg = apiErrorMap[detail] || detail;
          this.modalService.show('No rep!', friendlyMsg, '/home');
        },
      });
  }

  getMyInfo() {
    this.apiAuth.usersCurrentUserAuthMeGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiUserRead>) => {
        this.user.set(response.body);
      },
      error: (err: any) => {
        console.error('Error getting my user info', err);
        this.user.set(null);
      },
    });
  }

  getMyAthleteInfo() {
    this.apiAthlete.getMyAthleteDataAthleteMeGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiAthleteDetail>) => {
        this.athlete.set(response.body);
      },
      error: (err: any) => {
        console.error('Error getting my athlete info', err);
        this.athlete.set(null);
      },
    });
  }

  loginWithLocalToken() {
    // Initialize token from localStorage
    const savedToken = localStorage.getItem('cfgames-token');
    if (savedToken) {
      try {
        const parsedToken = JSON.parse(savedToken) as apiBearerResponse;
        this.token.set(parsedToken);
      } catch (error) {
        this.token.set(null);
        console.log('Error using token. Deleting from localstorage', error);
        localStorage.removeItem('cfgames-token');
      }
      if (this.token()) {
        this.apiAuth.usersCurrentUserAuthMeGet$Response().subscribe({
          next: (response: StrictHttpResponse<apiUserRead>) => {
            this.user.set(response.body);
            this.getMyAthleteInfo();
          },
          error: (err: any) => {
            this.user.set(null);
            this.token.set(null);
            localStorage.removeItem('cfgames-token');
          },
        });
      }
    }
  }
}
