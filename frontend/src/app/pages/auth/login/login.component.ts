import { Component, effect, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { apiAuthService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiBearerResponse } from '../../../api/models';
import { timer } from 'rxjs';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-login',
  imports: [AuthWrapperComponent, ReactiveFormsModule, NgIcon, RouterLink],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private userAuth = inject(UserAuthService);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private apiAuth = inject(apiAuthService);

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
      this.apiAuth
        .authDbLoginAuthLoginPost$Response({
          body: {
            username: this.loginForm.value.email,
            password: this.loginForm.value.password,
          },
        })
        .subscribe({
          next: (response: StrictHttpResponse<apiBearerResponse>) => {
            this.userAuth.token.set(response.body);
            this.userAuth.getMyInfo();
            this.toastService.showSuccess('Logged in', '/home');
          },
          error: (err: any) => {
            console.log(err);
            this.modalService.show(
              'Error during Login',
              err.error.detail,
              '/home'
            );
          },
        });
    }
  }

  constructor() {
    effect(() => {});
  }

  ngOnInit(): void {
    if (this.userAuth.user()) {
      this.loginForm.value.email = this.userAuth.user()!.email;
    }
  }
}
