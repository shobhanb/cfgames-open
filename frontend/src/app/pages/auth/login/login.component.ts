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
import { RouterLink } from '@angular/router';
import { LoggedinWarningService } from '../loggedin-warning.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-login',
  imports: [AuthWrapperComponent, ReactiveFormsModule, NgIcon, RouterLink],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private userAuth = inject(UserAuthService);
  private loggedinWarning = inject(LoggedinWarningService);

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
      this.userAuth.loginWithEmailAndPassword({
        username: this.loginForm.value.email,
        password: this.loginForm.value.password,
      });
    }
  }

  ngOnInit(): void {
    this.userAuth.loginWithLocalToken();
  }
  constructor() {
    effect(() => this.loggedinWarning.checkLoggedIn());
  }
}
