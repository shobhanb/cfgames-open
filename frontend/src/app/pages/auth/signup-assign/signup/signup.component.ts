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
import { AuthWrapperComponent } from '../../auth-wrapper/auth-wrapper.component';
import { SignupFormService } from '../signup-form.service';
import { ModalService } from '../../../../shared/modal/modal.service';
import { apiFireauthService } from '../../../../api/services';
import { ToastService } from '../../../../shared/toast/toast.service';
import {
  Auth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { UserAuthService } from '../../../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, AuthWrapperComponent, RouterLink, NgIcon],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private modalService = inject(ModalService);
  signupFormService = inject(SignupFormService);
  private apiFireAuth = inject(apiFireauthService);
  private fireAuth = inject(Auth);
  private userAuth = inject(UserAuthService);
  private toastService = inject(ToastService);

  loginForm = new FormGroup({
    // Not adding complex password requirements to keep it simple for lowest common denominator users
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password1: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    password2: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get formValid() {
    return (
      this.loginForm.dirty &&
      this.loginForm.valid &&
      !!this.loginForm.value.email &&
      !!this.loginForm.value.password1 &&
      !!this.loginForm.value.password2
    );
  }

  get passwordsMatch() {
    return this.loginForm.value.password1 === this.loginForm.value.password2;
  }

  onClickNotYou() {
    this.loginForm.reset();
    this.signupFormService.selectedAthleteId.set(null);
  }

  onClickSignUpWithEmail() {
    if (
      this.formValid &&
      this.passwordsMatch &&
      this.signupFormService.selectionValid()
    ) {
      this.apiFireAuth
        .createUserFireauthSignupPost({
          body: {
            email: this.loginForm.value.email!,
            password: this.loginForm.value.password1!,
            display_name: this.signupFormService.selectedName()!,
            affiliate_id: this.signupFormService.selectedAffiliateId()!,
            affiliate_name: this.signupFormService.selectedAffiliate()!,
            crossfit_id: this.signupFormService.selectedAthleteId()!,
          },
        })
        .subscribe({
          next: () => {
            signInWithEmailAndPassword(
              this.fireAuth,
              this.loginForm.value.email!,
              this.loginForm.value.password1!
            )
              .then((result: UserCredential) => {
                if (
                  this.fireAuth.currentUser &&
                  !this.fireAuth.currentUser.emailVerified
                ) {
                  this.userAuth
                    .sendVerificationEmail()
                    .then(() => {
                      this.modalService.showInfo(
                        'Success',
                        'Check your email for verification link',
                        '/public/home'
                      );
                    })
                    .catch((err: any) =>
                      console.error('Error sending verification email', err)
                    );
                }
              })
              .catch((err: any) => {
                console.error('Error signing in after signup', err);
              });
          },
          error: (err: any) => {
            this.modalService.showInfo('No Rep!', err.error.detail, '/home');
            console.error('Error during signup', err);
          },
        });
    }
  }
}
