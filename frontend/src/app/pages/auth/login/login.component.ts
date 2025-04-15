import { Component, inject, input } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { ProviderLoginComponent } from '../provider-login/provider-login.component';
import {
  Auth,
  AuthErrorCodes,
  signInWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';

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
  auth = inject(AuthService);
  router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickLogin() {
    if (
      this.loginForm.valid &&
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
}
