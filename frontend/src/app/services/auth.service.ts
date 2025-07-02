import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { apiAthleteService, apiFireauthService } from '../api/services';
import {
  ActionCodeSettings,
  Auth,
  idToken,
  IdTokenResult,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import {
  apiAthleteDetail,
  apiFirebaseCustomClaims,
  apiFirebaseUserRecord,
} from '../api/models';
import { FirebaseError } from '@angular/fire/app';
import { ToastService } from '../shared/toast/toast.service';
import { environment } from 'src/environments/environment';
import { CreateUserFireauthSignupPost$Params } from '../api/fn/fireauth/create-user-fireauth-signup-post';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private destroyRef = inject(DestroyRef);
  private apiAthlete = inject(apiAthleteService);
  private apiFireAuth = inject(apiFireauthService);
  private toastService = inject(ToastService);

  private auth = inject(Auth);
  // Signin, signout, token refresh
  private user$ = user(this.auth);
  private userSubscription: Subscription;

  // Signin, signout, token refresh
  private idToken$ = idToken(this.auth);
  private idTokenSubscription: Subscription;

  readonly user = signal<User | null>(null);
  readonly userCustomClaims = signal<apiFirebaseCustomClaims | null>(null);
  readonly token = signal<string | null>(null);
  readonly loggedIn = computed<boolean>(() => !!this.user() && !!this.token());
  readonly athlete = signal<apiAthleteDetail | null>(null);
  readonly userNameInitials = computed<string | null>(() => {
    const currentUser = this.user();
    if (currentUser && currentUser.displayName) {
      return currentUser.displayName
        .split(' ')
        .map((n) => n[0])
        .join('');
    }
    return null;
  });

  readonly verifiedUser = computed<boolean>(
    () => (!!this.user() && this.user()?.emailVerified) || false
  );

  readonly adminUser = computed<boolean>(
    () =>
      (!!this.user() &&
        this.user()?.emailVerified &&
        this.userCustomClaims()?.admin) ||
      false
  );

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.user.set(aUser);

      if (aUser) {
        aUser.getIdTokenResult().then((value: IdTokenResult) => {
          const customClaims = value.claims;
          this.userCustomClaims.set({
            admin: customClaims['admin'] ? true : false,
            affiliate_id:
              typeof customClaims['affiliate_id'] === 'number'
                ? customClaims['affiliate_id']
                : null,
            affiliate_name:
              typeof customClaims['affiliate_name'] === 'string'
                ? customClaims['affiliate_name']
                : null,
            crossfit_id:
              typeof customClaims['crossfit_id'] === 'number'
                ? customClaims['crossfit_id']
                : null,
          });
        });
      } else {
        this.userCustomClaims.set(null);
      }
    });

    this.idTokenSubscription = this.idToken$.subscribe(
      (token: string | null) => {
        this.token.set(token);
        if (!!token && !this.athlete() && this.user()?.emailVerified) {
          this.getMyAthleteInfo();
        } else {
          this.token.set(null);
        }
      }
    );

    this.destroyRef.onDestroy(() => {
      this.userSubscription.unsubscribe();
      this.idTokenSubscription.unsubscribe();
    });
  }

  loginWithEmailAndPassword(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((value: UserCredential) => {
        this.toastService.showToast('Logged in', 'success', '/', 1000);
      })
      .catch((err: FirebaseError) => {
        console.error(err);
        this.toastService.showToast(err.message, 'danger');
      });
  }

  logout() {
    signOut(this.auth).then(() =>
      this.toastService.showToast('Logged out', 'primary', '/', 1000)
    );
  }

  signup(params: CreateUserFireauthSignupPost$Params) {
    this.apiFireAuth.createUserFireauthSignupPost(params).subscribe({
      next: (value: apiFirebaseUserRecord) => {
        this.toastService.showToast('Signed up!', 'success', null, 1000);
        this.loginWithEmailAndPassword(params.body.email, params.body.password);
      },
      error: (err: any) => {
        console.error(err.error.detail);
        this.toastService.showToast(err.error.detail, 'danger', '/', 3000);
      },
    });
  }

  getMyAthleteInfo() {
    return this.apiAthlete.getMyAthleteDataAthleteMeGet().subscribe({
      next: (data: apiAthleteDetail) => {
        this.athlete.set(data);
      },
      error: (err: Error) => {
        console.error('Error getting my athlete info', err);
        this.athlete.set(null);
        this.toastService.showToast(err.message, 'danger');
      },
    });
  }

  async sendVerificationEmail() {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${environment.frontendUrl}/auth/verify`,
      handleCodeInApp: true,
    };
    sendEmailVerification(this.user()!, actionCodeSettings)
      .then(() => {
        this.toastService.showToast(
          'Sent verification email',
          'success',
          null,
          1000
        );
      })
      .catch((err: any) => {
        this.toastService.showToast(
          'Error sending verification email',
          'danger',
          null,
          1000
        );
      });
  }

  refreshTokenAfterVerification() {
    this.auth.currentUser?.reload().then(() => {
      this.auth.currentUser
        ?.getIdToken(true)
        .then((idToken: string) => this.token.set(idToken));
    });
  }
}
