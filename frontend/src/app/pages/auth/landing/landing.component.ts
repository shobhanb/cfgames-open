import { Component, effect, inject } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { RouterLink } from '@angular/router';
import { LoggedinWarningService } from '../../../shared/auth/loggedin-warning.service';

@Component({
  selector: 'app-landing',
  imports: [AuthWrapperComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  private loggedinWarningService = inject(LoggedinWarningService);

  constructor() {
    effect(() => {
      this.loggedinWarningService.checkLoggedIn();
    });
  }
}
