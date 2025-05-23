import { Component, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ActivatedRoute } from '@angular/router';
import { apiAuthService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiUserRead } from '../../../api/models';
import { ModalService } from '../../../shared/modal/modal.service';

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
        next: (response: StrictHttpResponse<apiUserRead>) => {
          this.verified = true;
        },
        error: (err: any) => {
          console.log('Error verifying email', err);
          this.modalService.show(
            'Error',
            `Error verifying email: ${err.error.detail}`,
            '/home'
          );
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
