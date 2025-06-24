import { Component, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { timer } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { Auth, sendEmailVerification } from '@angular/fire/auth';

@Component({
  selector: 'app-not-verified',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './not-verified.component.html',
  styleUrl: './not-verified.component.css',
})
export class NotVerifiedComponent {
  userAuth = inject(UserAuthService);
  private auth = inject(Auth);
  private router = inject(Router);

  emailSent = false;

  emailForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  onClickSendEmail() {
    this.userAuth
      .sendVerificationEmail()
      .then(() => {
        this.emailSent = true;
        timer(3000).subscribe(() => {
          this.router.navigate(['/home']);
        });
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
