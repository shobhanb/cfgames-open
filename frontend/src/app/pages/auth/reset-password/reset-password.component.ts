import { Component, effect, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoggedinWarningService } from '../loggedin-warning.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-reset-password',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userAuth = inject(UserAuthService);
  private modalService = inject(ModalService);
  private loggedinWarning = inject(LoggedinWarningService);

  private token: string | null = null;

  form = new FormGroup({
    password1: new FormControl('', { validators: [Validators.required] }),
    password2: new FormControl('', { validators: [Validators.required] }),
  });

  get tokenValid() {
    return !!this.token;
  }

  get formValid() {
    return (
      this.form.dirty &&
      this.form.valid &&
      !!this.form.value.password1 &&
      !!this.form.value.password2
    );
  }

  get passwordsMatch() {
    return this.form.value.password1 === this.form.value.password2;
  }

  onSubmit() {
    if (this.tokenValid && this.formValid && this.passwordsMatch) {
      this.userAuth.resetPassword({
        token: this.token!,
        password: this.form.value.password1!,
      });
    }
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }
  constructor() {
    effect(() => this.loggedinWarning.checkLoggedIn());
  }
}
