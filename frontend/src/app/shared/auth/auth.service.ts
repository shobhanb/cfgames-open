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
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  UserCredential,
  connectAuthEmulator,
  IdTokenResult,
  idToken,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  customClaims,
  hasCustomClaim,
  idTokenResult,
} from '@angular/fire/auth-guard';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  fireAuth = inject(Auth);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  emulator = connectAuthEmulator(this.fireAuth, 'http://127.0.0.1:9099', {
    disableWarnings: true,
  });

  redirectURL = '';
  userSubscription$: Subscription;
  user = signal<User | null>(null);

  userEmail = computed<string | null>(() => this.user()?.email ?? null);
  userName = computed<string | null>(() => this.user()?.displayName ?? null);
  userInitials = computed<string | null>(
    () =>
      this.userName()
        ?.split(' ')
        .map((n) => n[0])
        .join('') ?? null
  );
  userPhotoURL = computed<string | null>(() => this.user()?.photoURL ?? null);
  userAthleteIds = signal<string[] | null | unknown | undefined>(null);

  uiState = signal<string>('landing');

  newUserGym = signal<string | null>(null);
  newUserName = signal<string | null>(null);
  newUserAthleteId = signal<string | null>(null);
  newUserEmail = signal<string | null>(null);

  handleUserCredential(userCred: UserCredential) {
    userCred.user.getIdTokenResult().then(this.checkCustomClaims);
  }

  checkCustomClaims(idTokenResult: IdTokenResult) {
    console.log(idTokenResult);
    const athleteIds: string[] | unknown = idTokenResult.claims.athleteIds;
    if (athleteIds) {
      // Custom Claims exist
      // athleteIds is a custom claim list of type string[] e.g. ['12345', '23456']
      try {
        this.userAthleteIds.set(athleteIds);
      } catch (error) {
        console.log(error);
      }
      this.router.navigateByUrl('/home');
      // console.log(this.userAthleteIds());
    } else {
      // No custom claims. Go to assignment
      this.router.navigateByUrl('/auth/assign-athlete');
    }
  }

  async loginWithEmailPassword(email: string, password: string) {
    return await signInWithEmailAndPassword(this.fireAuth, email, password);
  }

  async signUpWithEmailPassword(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.fireAuth, email, password);
  }

  async loginWithGoogle() {
    return await signInWithPopup(this.fireAuth, new GoogleAuthProvider());
  }

  async logout() {
    return await signOut(this.fireAuth);
  }

  constructor() {
    // this.user = toSignal(user(this.fireAuth), { initialValue: null });
    this.userSubscription$ = user(this.fireAuth).subscribe(
      (aUser: User | null) => {
        console.log(aUser);
        this.user.set(aUser);
        if (aUser) {
          aUser.getIdTokenResult().then(this.checkCustomClaims);
        } else {
          this.userAthleteIds.set(null);
        }
      }
    );

    this.destroyRef.onDestroy(() => {
      this.userSubscription$.unsubscribe();
    });
  }
}
