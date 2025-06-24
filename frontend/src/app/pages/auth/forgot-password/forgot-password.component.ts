import { Component, inject, signal } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
import { apiErrorMap } from '../../../shared/error-mapping';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private auth = inject(Auth);
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
      sendPasswordResetEmail(this.auth, this.forgotPasswordForm.value.email);
    }
  }
}
