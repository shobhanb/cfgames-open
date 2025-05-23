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
import { UserAuthService } from '../../../../shared/user-auth/user-auth.service';
import { apiAuthService } from '../../../../api/services';
import { StrictHttpResponse } from '../../../../api/strict-http-response';
import { apiUserRead } from '../../../../api/models';
import { ToastService } from '../../../../shared/toast/toast.service';

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
  private apiAuth = inject(apiAuthService);
  private userAuth = inject(UserAuthService);
  private toastService = inject(ToastService);

  loginForm = new FormGroup({
    // Not adding password requirements to keep it simple for lowest common denominator users
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickNotYou() {
    this.loginForm.reset();
    this.signupFormService.selectedAthleteId.set(null);
    this.signupFormService.enteredEmail.set(null);
  }

  onClickSignUpWithEmail() {
    if (
      this.loginForm.valid &&
      this.loginForm.dirty &&
      this.loginForm.value.password &&
      this.signupFormService.selectionValid()
    ) {
      this.apiAuth
        .registerRegisterAuthRegisterPost$Response({
          body: {
            email: this.signupFormService.enteredEmail()!,
            password: this.loginForm.value.password,
            affiliate: this.signupFormService.selectedAffiliate()!,
            affiliate_id: this.signupFormService.selectedAffiliateId()!,
            athlete_id: this.signupFormService.selectedAthleteId()!,
            name: this.signupFormService.selectedName()!,
          },
        })
        .subscribe({
          next: (response: StrictHttpResponse<apiUserRead>) => {
            this.toastService.showSuccess('Registered, logging in');

            this.userAuth.loginWithEmailAndPassword({
              username: this.signupFormService.enteredEmail()!,
              password: this.loginForm.value.password!,
            });
          },
          error: (err: any) => {
            console.log('Error during registration', err);
            this.modalService.show(
              'Error during registration',
              err.error.detail,
              '/home'
            );
          },
        });
    }
  }
}
