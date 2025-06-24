import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { StrictHttpResponse } from '../../api/strict-http-response';
import { ToastService } from '../toast/toast.service';
import { ModalService } from '../modal/modal.service';
import {
  Auth,
  idToken,
  IdTokenResult,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
  user,
  UserCredential,
  ActionCodeSettings,
  applyActionCode,
} from '@angular/fire/auth';
import { apiAthleteService } from '../../api/services';
import { Subscription } from 'rxjs';
import { apiAthleteDetail, apiFirebaseCustomClaims } from '../../api/models';
import { FirebaseError } from 'firebase/app';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private apiAthlete = inject(apiAthleteService);

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

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      this.user.set(aUser);

      if (aUser) {
        aUser.getIdTokenResult().then((value: IdTokenResult) => {
          const customClaims = value.claims;
          this.userCustomClaims.set({
            admin: customClaims.admin ? true : false,
            affiliate_id:
              typeof customClaims.affiliate_id === 'number'
                ? customClaims.affiliate_id
                : null,
            affiliate_name:
              typeof customClaims.affiliate_name === 'string'
                ? customClaims.affiliate_name
                : null,
            crossfit_id:
              typeof customClaims.crossfit_id === 'number'
                ? customClaims.crossfit_id
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
        if (!this.athlete()) {
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
        this.toastService.showSuccess('Logged in', '/public/home');
      })
      .catch((err: FirebaseError) => {
        console.error(err);
        this.toastService.showError(err.message);
      });
  }

  logout() {
    signOut(this.auth);
  }

  getMyAthleteInfo() {
    return this.apiAthlete.getMyAthleteDataAthleteMeGet().subscribe({
      next: (data: apiAthleteDetail) => {
        this.athlete.set(data);
      },
      error: (err: Error) => {
        console.error('Error getting my athlete info', err);
        this.athlete.set(null);
        this.toastService.showError(err.message);
      },
    });
  }

  async sendVerificationEmail(): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: `http://localhost:4200/auth/verify`,
      handleCodeInApp: true,
    };
    return await sendEmailVerification(this.user()!, actionCodeSettings);
  }

  refreshTokenAfterVerification() {
    this.auth.currentUser?.reload().then(() => {
      this.auth.currentUser
        ?.getIdToken(true)
        .then((idToken: string) => this.token.set(idToken));
    });
  }
}
