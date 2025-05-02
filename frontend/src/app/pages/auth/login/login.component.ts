import { Component, effect, inject } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { ProviderLoginComponent } from '../provider-login/provider-login.component';
import { AuthErrorCodes } from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
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
export class LoginComponent {
  private auth = inject(AuthService);
  private loggedinWarningService = inject(LoggedinWarningService);

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

  constructor() {
    effect(() => {
      this.loggedinWarningService.checkLoggedIn();
    });
  }
}
