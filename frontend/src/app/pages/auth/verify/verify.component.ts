import { Component, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../../../shared/modal/modal.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-verify',
  imports: [AuthWrapperComponent],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);
  userAuth = inject(UserAuthService);

  private token: string | null = null;
  verified = false;

  private verify(token: string) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!!this.token) {
      this.verify(this.token);
    }
  }
}
