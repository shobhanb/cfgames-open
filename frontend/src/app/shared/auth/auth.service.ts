import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  user,
  createUserWithEmailAndPassword,
  IdTokenResult,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private fireAuth = inject(Auth);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // private emulator = connectAuthEmulator(
  //   this.fireAuth,
  //   'http://127.0.0.1:9099',
  //   {
  //     disableWarnings: true,
  //   }
  // );

  private userSubscription$: Subscription;

  user = signal<User | null>(null);
  userAthleteId = signal<number | null>(null);

  userAdminRole = signal<string | null>(null);
  userAdminAll = computed<boolean>(() => this.userAdminRole() === 'all');
  userAdminGym = computed<boolean>(() => this.userAdminRole() === 'gym');
  userAdminTeam = computed<boolean>(() => this.userAdminRole() === 'team');

  userEmail = computed<string | null>(() => this.user()?.email ?? null);
  userName = computed<string | null>(() => this.user()?.displayName ?? null);
  userInitials = computed<string | null>(
    () =>
      this.userName()
        ?.toUpperCase()
        ?.split(' ')
        .map((n) => n[0])
        .join('') ?? null
  );
  userPhotoURL = computed<string | null>(() => this.user()?.photoURL ?? null);

  private postLoginSuccessHook = (userCred: UserCredential) => {
    if (userCred) {
      this.router.navigate(['/home']);
    }
  };

  async loginWithEmailPassword(email: string, password: string) {
    return await signInWithEmailAndPassword(
      this.fireAuth,
      email,
      password
    ).then(this.postLoginSuccessHook);
  }

  async loginWithGoogle() {
    return await signInWithPopup(this.fireAuth, new GoogleAuthProvider()).then(
      this.postLoginSuccessHook
    );
  }

  async signUpWithEmailPassword(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.fireAuth, email, password);
  }

  async logout() {
    await signOut(this.fireAuth);
  }

  async updateUser(name: string, athleteId: number) {}

  constructor() {
    // Sign in, sign out & refresh token subscription to
    // assign all the user info and custom claims
    this.userSubscription$ = user(this.fireAuth).subscribe(
      (aUser: User | null) => {
        this.user.set(aUser);
        if (aUser) {
          aUser.getIdTokenResult().then((idTokenResult: IdTokenResult) => {
            // Admin claims
            const adminClaim: string | unknown = idTokenResult.claims.admin;
            if (!!adminClaim) {
              this.userAdminRole.set(adminClaim as string);
            } else {
              this.userAdminRole.set(null);
            }

            // Athlete Id claim
            const athleteIdClaim: number | unknown =
              idTokenResult.claims.athlete_id;
            if (!!athleteIdClaim) {
              this.userAthleteId.set(athleteIdClaim as number);
            }
          });
        } else {
          this.userAthleteId.set(null);
          this.userAdminRole.set(null);
        }
      }
    );

    this.destroyRef.onDestroy(() => {
      this.userSubscription$.unsubscribe();
    });
  }
}
