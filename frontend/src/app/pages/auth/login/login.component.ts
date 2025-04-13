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

@Component({
  selector: 'app-login',
  imports: [AuthWrapperComponent, ReactiveFormsModule, NgIcon],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  auth = inject(AuthService);

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  get newUser() {
    return this.auth.uiState() === 'newUserLogin';
  }

  onClickCancel() {
    this.auth.uiState.set('landing');
  }
}
