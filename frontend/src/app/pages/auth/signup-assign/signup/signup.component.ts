import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';
import { FirebaseError } from '@angular/fire/app';
import { AuthErrorCodes, UserCredential } from '@angular/fire/auth';
import { AuthWrapperComponent } from '../../auth-wrapper/auth-wrapper.component';
import { ProviderLoginComponent } from '../../provider-login/provider-login.component';
import { AuthService } from '../../../../shared/auth/auth.service';
import { SignupFormService } from '../signup-form.service';
import { ModalService } from '../../../../shared/modal/modal.service';

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
  private auth = inject(AuthService);
  private modalService = inject(ModalService);
  signupFormService = inject(SignupFormService);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickNotYou() {
    this.signupFormService.selectedAthleteId.set(null);
  }

  onClickSignUpWithEmail() {
    if (
      this.loginForm.valid &&
      this.loginForm.dirty &&
      this.loginForm.value.email &&
      this.loginForm.value.password &&
      this.signupFormService.selectionValid()
    ) {
      this.auth
        .signUpWithEmailPassword(
          this.loginForm.value.email,
          this.loginForm.value.password
        )
        .then((aUser: UserCredential) =>
          this.auth.updateUser(
            this.signupFormService.selectedName()!,
            this.signupFormService.selectedAthleteId()!
          )
        )
        .catch((error: FirebaseError) => {
          if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
            console.log('Email already in use');
            this.modalService.show(
              'Error',
              'Email already in use. Redirecting to login page',
              '/auth/login'
            );
          } else {
            console.error(error);
            this.modalService.show('Error', error.code);
          }
        });
    }
  }
}
