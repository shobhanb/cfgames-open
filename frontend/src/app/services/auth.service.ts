import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { apiAthleteService } from '../api/services';
import {
  Auth,
  idToken,
  IdTokenResult,
  sendEmailVerification,
  signOut,
  User,
  user,
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { apiAthleteDetail, apiFirebaseCustomClaims } from '../api/models';
import { FirebaseError } from '@angular/fire/app';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private destroyRef = inject(DestroyRef);
  private apiAthlete = inject(apiAthleteService);
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
        if (
          !!token &&
          !this.athlete() &&
          this.user() &&
          this.user()!.emailVerified
        ) {
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

  async logout() {
    await signOut(this.auth).then(() =>
      this.toastService.showToast('Logged out', 'primary', '/', 1000)
    );
  }

  async getMyAthleteInfo(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiAthlete.getMyAthleteDataAthleteMeGet().subscribe({
        next: (data: apiAthleteDetail) => {
          this.athlete.set(data);
          resolve(true);
        },
        error: (err: Error) => {
          console.error('Error getting my athlete info', err);
          this.athlete.set(null);
          reject(err);
        },
      });
    });
  }

  async sendVerificationEmail() {
    sendEmailVerification(this.user()!)
      .then(() => {
        this.toastService.showToast(
          'Sent verification email',
          'success',
          null,
          1000
        );
      })
      .catch((err: FirebaseError) => {
        this.toastService.showToast(
          `Error sending verification email: ${err.message}`,
          'danger',
          null,
          1000
        );
      });
  }

  async refreshTokenAfterVerification() {
    this.auth.currentUser?.reload().then(() => {
      this.auth.currentUser
        ?.getIdToken(true)
        .then((idToken: string) => this.token.set(idToken));
    });
  }
}
