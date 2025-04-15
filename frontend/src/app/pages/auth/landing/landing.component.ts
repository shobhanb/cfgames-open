import { Component, inject } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { AuthService } from '../../../shared/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [AuthWrapperComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  auth = inject(AuthService);
  router = inject(Router);

  // onClickSignup() {
  //   this.auth.uiState.set('newUserLogin');
  // }

  // onClickLogin() {
  //   this.auth.uiState.set('existingUserLogin');
  // }

  // onClickCancel() {
  //   this.router.navigateByUrl('/leaderboard');
  // }
}
