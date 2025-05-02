import { Component, effect, inject, OnInit } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AssignAthleteComponent } from './assign-athlete/assign-athlete.component';
import { SignupFormService } from './signup-form.service';
import { LoggedinWarningService } from '../../../shared/auth/loggedin-warning.service';

@Component({
  selector: 'app-signup-assign',
  imports: [SignupComponent, AssignAthleteComponent],
  templateUrl: './signup-assign.component.html',
  styleUrl: './signup-assign.component.css',
})
export class SignupAssignComponent {
  private loggedinWarningService = inject(LoggedinWarningService);
  signupFormService = inject(SignupFormService);

  constructor() {
    effect(() => {
      this.loggedinWarningService.checkLoggedIn();
    });
  }
}
