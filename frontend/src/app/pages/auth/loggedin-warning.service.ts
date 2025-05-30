import { inject, Injectable } from '@angular/core';
import { UserAuthService } from '../../shared/user-auth/user-auth.service';
import { ModalService } from '../../shared/modal/modal.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedinWarningService {
  private userAuth = inject(UserAuthService);
  private modalService = inject(ModalService);

  checkLoggedIn() {
    if (this.userAuth.loggedIn()) {
      // this.modalService.show('Oops', 'Log out before you can proceed', '/home');
    }
  }

  constructor() {}
}
