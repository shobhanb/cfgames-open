import { Component, inject } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { apiAuthService } from '../../../api/services';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-verified',
  imports: [AuthWrapperComponent, ReactiveFormsModule],
  templateUrl: './not-verified.component.html',
  styleUrl: './not-verified.component.css',
})
export class NotVerifiedComponent {
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
}
