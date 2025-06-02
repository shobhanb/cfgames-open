import { Component, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { ActivatedRoute } from '@angular/router';
import { apiAuthService } from '../../../api/services';
import { ModalService } from '../../../shared/modal/modal.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiErrorMap } from '../../../shared/error-mapping';

@Component({
  selector: 'app-verify',
  imports: [AuthWrapperComponent],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiAuth = inject(apiAuthService);
  private modalService = inject(ModalService);
  userAuth = inject(UserAuthService);

  private token: string | null = null;
  verified = false;

  private verify(token: string) {
    this.apiAuth
      .verifyVerifyAuthVerifyPost$Response({ body: { token: token } })
      .subscribe({
        next: () => {
          this.verified = true;
          if (this.userAuth.loggedIn()) {
            this.userAuth.getMyInfo();
            this.userAuth.getMyAthleteInfo();
          }
        },
        error: (err: any) => {
          console.log('Error verifying email', err);
          const detail: string = String(err?.error?.detail ?? '');
          const friendlyMsg = apiErrorMap[detail] || detail;
          this.modalService.show('No Rep!', friendlyMsg, '/home');
        },
      });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!!this.token) {
      this.verify(this.token);
    }
  }
}
