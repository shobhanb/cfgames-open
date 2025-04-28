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
  authState,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { AdminRole } from './admin-role';

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
  userAdminAll = computed<boolean>(
    () => this.userAdminRole() === AdminRole.adminAll
  );
  userAdminGym = computed<boolean>(
    () => this.userAdminRole() === AdminRole.adminGym
  );
  userAdminTeam = computed<boolean>(
    () => this.userAdminRole() === AdminRole.adminTeam
  );

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
        console.log('Usersub user signal is truthy' + !!this.user());
        if (aUser) {
          aUser.getIdTokenResult().then((idTokenResult: IdTokenResult) => {
            // Admin claims
            const adminClaim = idTokenResult.claims.admin;
            if (typeof adminClaim === 'string') {
              this.userAdminRole.set(adminClaim);
            } else {
              this.userAdminRole.set(null);
            }

            // Athlete Id claims
            const athleteIdClaim = idTokenResult.claims.athleteId;
            if (typeof athleteIdClaim === 'number') {
              this.userAthleteId.set(athleteIdClaim);
            } else {
              this.userAthleteId.set(null);
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
