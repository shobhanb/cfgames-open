import { Component, effect, inject, OnInit } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AssignAthleteComponent } from './assign-athlete/assign-athlete.component';
import { SignupFormService } from './signup-form.service';
import { LoggedinWarningService } from '../loggedin-warning.service';

@Component({
  selector: 'app-signup-assign',
  imports: [SignupComponent, AssignAthleteComponent],
  templateUrl: './signup-assign.component.html',
  styleUrl: './signup-assign.component.css',
})
export class SignupAssignComponent {
  signupFormService = inject(SignupFormService);
  private loggedinWarning = inject(LoggedinWarningService);

  constructor() {
    effect(() => this.loggedinWarning.checkLoggedIn());
  }
}
