import { Component, inject, signal } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { apiAuthService } from '../../../api/services';
import { ModalService } from '../../../shared/modal/modal.service';
import { apiErrorMap } from '../../../shared/error-mapping';

@Component({
  selector: 'app-forgot-password',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private apiAuth = inject(apiAuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  onSubmit() {
    if (
      this.forgotPasswordForm.dirty &&
      this.forgotPasswordForm.valid &&
      this.forgotPasswordForm.value.email
    ) {
      this.apiAuth
        .resetForgotPasswordAuthForgotPasswordPost$Response({
          body: { email: this.forgotPasswordForm.value.email },
        })
        .subscribe({
          next: () => {
            this.modalService.showInfo(
              'Rep!',
              'Reset password email sent.',
              '/home'
            );
          },
          error: (err: any) => {
            console.log('Error in ForgotPasswordSubmit', err);
            const detail: string = String(err?.error?.detail ?? '');
            const friendlyMsg = apiErrorMap[detail] || detail;
            this.modalService.showInfo('No Rep!', friendlyMsg, '/home');
          },
        });
    }
  }
}
