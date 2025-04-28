import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ModalService } from '../modal/modal.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedinWarningService {
  private auth = inject(AuthService);
  private modalService = inject(ModalService);

  checkLoggedIn() {
    console.log('Landing Service check user is ' + !!this.auth.user());
    if (!!this.auth.user()) {
      this.modalService.show(
        'Uh oh',
        'Already logged in. Sign out to sign in as a different user',
        '/home'
      );
    }
  }

  constructor() {}
}
