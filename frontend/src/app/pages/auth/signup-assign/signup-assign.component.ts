import { Component, inject, OnInit } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AssignAthleteComponent } from './assign-athlete/assign-athlete.component';
import { SignupFormService } from './signup-form.service';

@Component({
  selector: 'app-signup-assign',
  imports: [SignupComponent, AssignAthleteComponent],
  templateUrl: './signup-assign.component.html',
  styleUrl: './signup-assign.component.css',
})
export class SignupAssignComponent implements OnInit {
  signupFormService = inject(SignupFormService);

  ngOnInit(): void {
    this.signupFormService.getAthleteData();
  }

  constructor() {}
}
