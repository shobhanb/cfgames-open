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
  connectAuthEmulator,
  IdTokenResult,
  authState,
  UserCredential,
  signInWithCredential,
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

  private emulator = connectAuthEmulator(
    this.fireAuth,
    'http://127.0.0.1:9099',
    {
      disableWarnings: true,
    }
  );

  redirectURL = '';
  private userSubscription$: Subscription;

  user = signal<User | null>(null);
  userAthleteId = signal<number | null>(null);

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

  newUserGym = signal<string | null>(null);
  newUserName = signal<string | null>(null);
  newUserAthleteId = signal<string | null>(null);
  newUserEmail = signal<string | null>(null);

  async loginWithEmailPassword(email: string, password: string) {
    return await signInWithEmailAndPassword(this.fireAuth, email, password);
  }

  async signUpWithEmailPassword(email: string, password: string) {
    await createUserWithEmailAndPassword(this.fireAuth, email, password).then(
      (userCred: UserCredential) => {
        this.user.set(userCred.user);
      }
    );
  }

  async loginWithGoogle() {
    return await signInWithPopup(this.fireAuth, new GoogleAuthProvider());
  }

  async logout() {
    await signOut(this.fireAuth);
    this.router.navigateByUrl('/home');
  }

  async assignAthleteIds(athletId: string) {
    console.log(
      `Assigning athlete id %s to user %s`,
      athletId,
      this.userEmail()
    );
  }

  constructor() {
    this.userSubscription$ = user(this.fireAuth).subscribe(
      (aUser: User | null) => {
        this.user.set(aUser);
        if (aUser) {
          aUser.getIdTokenResult().then((idTokenResult: IdTokenResult) => {
            const athleteIdClaim = idTokenResult.claims.athleteId;
            if (typeof athleteIdClaim === 'number') {
              this.userAthleteId.set(athleteIdClaim);
              this.router.navigateByUrl('/home');
            } else {
              this.userAthleteId.set(null);
              this.router.navigateByUrl('/auth/assign-athlete');
            }
          });
        } else {
          this.userAthleteId.set(null);
        }
      }
    );

    this.destroyRef.onDestroy(() => {
      this.userSubscription$.unsubscribe();
    });
  }
}
