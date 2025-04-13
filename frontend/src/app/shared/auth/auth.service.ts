import {
  computed,
  inject,
  Injectable,
  OnDestroy,
  signal,
  TransferState,
} from '@angular/core';
import {
  Auth,
  authState,
  EmailAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
  user,
  connectAuthEmulator,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RedirectCommand, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  fireAuth = inject(Auth);
  router = inject(Router);

  // emulator = connectAuthEmulator(this.fireAuth, 'http://127.0.0.1:9099', {
  //   disableWarnings: true,
  // });

  redirectURL = '';
  user = signal<User | null>(null).asReadonly();
  userEmail = computed<string | null>(() => this.user()?.email ?? null);
  userName = computed<string | null>(() => this.user()?.displayName ?? null);
  userPhotoURL = computed<string | null>(() => this.user()?.photoURL ?? null);

  uiState = signal<string>('landing');

  newUserGym = signal<string | null>(null);
  newUserName = signal<string | null>(null);
  newUserAthleteId = signal<string | null>(null);
  newUserEmail = signal<string | null>(null);

  async loginWithEmailPassword(email: string, password: string) {
    await signInWithEmailAndPassword(this.fireAuth, email, password)
      .then((userCred: UserCredential) => {
        console.log(userCred);
      })
      .catch((error) => {
        console.error(error);
        if (error === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
          // User not created. Create account
          this.signUpWithEmailPassword(email, password);
        }
      });
  }

  async signUpWithEmailPassword(email: string, password: string) {
    await createUserWithEmailAndPassword(this.fireAuth, email, password)
      .then((userCred: UserCredential) => {
        console.log(userCred);
        console.log(this.user);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.fireAuth, provider)
      .then((userCred: UserCredential) => {
        console.log(userCred);
        this.router.navigateByUrl(this.redirectURL);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async logout() {
    return await signOut(this.fireAuth);
  }

  constructor() {
    this.user = toSignal(authState(this.fireAuth), { initialValue: null });
  }
}
