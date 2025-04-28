import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';
import { AuthService } from '../../../shared/auth/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ProviderLoginComponent } from '../provider-login/provider-login.component';
import { AuthErrorCodes } from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import { filter, Subscription } from 'rxjs';
import { LoggedinWarningService } from '../../../shared/auth/loggedin-warning.service';

@Component({
  selector: 'app-login',
  imports: [
    AuthWrapperComponent,
    ReactiveFormsModule,
    NgIcon,
    RouterLink,
    ProviderLoginComponent,
  ],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private loggedinWarningService = inject(LoggedinWarningService);

  private routerSubscription$: Subscription | undefined;
  private destroyRef = inject(DestroyRef);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickLogin() {
    if (
      this.loginForm.valid &&
      this.loginForm.dirty &&
      this.loginForm.value.email &&
      this.loginForm.value.password
    ) {
      this.auth
        .loginWithEmailPassword(
          this.loginForm.value.email,
          this.loginForm.value.password
        )
        .catch((error: FirebaseError) => {
          if (error.code === AuthErrorCodes.USER_DELETED) {
            console.log('User not found. Please signup');
          } else {
            console.error(error);
          }
        });
    }
  }

  ngOnInit(): void {
    this.loggedinWarningService.checkLoggedIn();
  }
}
