import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { apiAthleteService } from '../api/services';
import {
  Auth,
  IdTokenResult,
  sendEmailVerification,
  signOut,
  User,
} from '@angular/fire/auth';
import { apiAthleteDetail, apiFirebaseCustomClaims } from '../api/models';
import { FirebaseError } from '@angular/fire/app';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);

  private auth = inject(Auth);

  readonly user = linkedSignal<User | null>(() => null, {
    equal: (a, b) =>
      a?.uid === b?.uid &&
      a?.emailVerified === b?.emailVerified &&
      a?.displayName === b?.displayName,
  });

  readonly userCustomClaims = linkedSignal<apiFirebaseCustomClaims | null>(
    () => null,
    {
      equal: (a, b) =>
        a?.admin === b?.admin &&
        a?.affiliate_id === b?.affiliate_id &&
        a?.affiliate_name === b?.affiliate_name &&
        a?.crossfit_id === b?.crossfit_id,
    }
  );

  readonly athlete = linkedSignal<apiAthleteDetail | null>(() => null, {
    equal: (a, b) =>
      a?.affiliate_id === b?.affiliate_id &&
      a?.affiliate_name === b?.affiliate_name &&
      a?.age_category === b?.age_category &&
      a?.crossfit_id === b?.crossfit_id &&
      a?.gender === b?.gender &&
      a?.name === b?.name &&
      a?.team_name === b?.team_name &&
      a?.team_role === b?.team_role &&
      a?.year === b?.year,
  });

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
    this.auth.onAuthStateChanged((user: User | null) => {
      this.user.set(user);

      if (user) {
        user.getIdTokenResult().then((value: IdTokenResult) => {
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

        if (!this.athlete()) {
          this.getMyAthleteInfo();
        }
      } else {
        this.userCustomClaims.set(null);
        this.athlete.set(null);
      }
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
      this.auth.currentUser?.getIdToken(true);
    });
  }
}
