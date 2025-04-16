import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { AuthService } from '../../../shared/auth/auth.service';
import { RouterLink } from '@angular/router';
import { ProviderLoginComponent } from '../provider-login/provider-login.component';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';
import { FirebaseError } from '@angular/fire/app';
import { AuthErrorCodes } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    AuthWrapperComponent,
    RouterLink,
    ProviderLoginComponent,
    NgIcon,
  ],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  auth = inject(AuthService);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickSignUp() {
    if (
      this.loginForm.valid &&
      this.loginForm.dirty &&
      this.loginForm.value.email &&
      this.loginForm.value.password
    ) {
      this.auth
        .signUpWithEmailPassword(
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
}
