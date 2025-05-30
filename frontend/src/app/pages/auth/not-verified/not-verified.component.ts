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
import { apiAuthService } from '../../../api/services';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-not-verified',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './not-verified.component.html',
  styleUrl: './not-verified.component.css',
})
export class NotVerifiedComponent implements OnInit {
  private apiAuth = inject(apiAuthService);
  userAuth = inject(UserAuthService);
  private router = inject(Router);

  emailSent = false;

  emailForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  onClickSendEmail() {
    const email: string =
      this.userAuth.user()?.email || this.emailForm.value.email || '';

    if (this.userAuth.user()) {
    }
    this.apiAuth
      .verifyRequestTokenAuthRequestVerifyTokenPost$Response({
        body: { email: email },
      })
      .subscribe({
        next: () => {
          this.emailSent = true;

          timer(3000).subscribe(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (err: any) => {
          console.log('Error requesting verification email', err);
        },
      });
  }

  ngOnInit(): void {
    if (!!this.userAuth.user()) {
      this.emailForm.controls.email.setValue(this.userAuth.user()!.email);
    }
  }
}
