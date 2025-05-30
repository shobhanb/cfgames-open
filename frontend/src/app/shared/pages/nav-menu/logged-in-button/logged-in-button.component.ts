import { Component, inject } from '@angular/core';
import { UserAuthService } from '../../../user-auth/user-auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logged-in-button',
  imports: [RouterLink],
  templateUrl: './logged-in-button.component.html',
  styleUrl: './logged-in-button.component.css',
})
export class LoggedInButtonComponent {
  userAuth = inject(UserAuthService);

  onClickSignOut() {
    this.userAuth.logout();
  }
}
