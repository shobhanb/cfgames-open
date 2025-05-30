import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthWrapperComponent } from '../../auth-wrapper/auth-wrapper.component';
import { SignupFormService } from '../signup-form.service';

@Component({
  selector: 'app-assign-athlete',
  imports: [AuthWrapperComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './assign-athlete.component.html',
  styleUrl: './assign-athlete.component.css',
})
export class AssignAthleteComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  signupFormService = inject(SignupFormService);

  private gymFormControlSubscription$: any;
  private nameFormControlSubscription$: any;

  form = new FormGroup({
    gym: new FormControl('', { validators: [Validators.required] }),
    name: new FormControl('', { validators: [Validators.required] }),
    athleteId: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  get isAthleteIdInvalid() {
    return (
      this.form.controls.athleteId.invalid && this.form.controls.athleteId.dirty
    );
  }

  get isEmailInvalid() {
    return this.form.controls.email.invalid && this.form.controls.email.dirty;
  }

  onSubmit() {
    if (
      this.form.valid &&
      this.form.dirty &&
      this.form.value.gym &&
      this.form.value.name &&
      this.form.value.athleteId &&
      this.form.value.email
    ) {
      this.signupFormService.selectedAthleteId.set(
        Number(this.form.value.athleteId)
      );
      this.signupFormService.enteredEmail.set(
        this.form.value.email.toLowerCase().trim()
      );
    }
  }

  onClickCancel() {
    this.form.reset();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.signupFormService.getAthleteData();

    if (this.signupFormService.gyms().length == 1) {
      this.form.controls.gym.setValue(this.signupFormService.gyms()[0]);
    }

    this.gymFormControlSubscription$ =
      this.form.controls.gym.valueChanges.subscribe((value) => {
        this.form.controls.name.setValue('');
        this.form.controls.athleteId.setValue('');
        this.signupFormService.selectedAffiliate.set(value);
      });

    this.nameFormControlSubscription$ =
      this.form.controls.name.valueChanges.subscribe((value) => {
        this.signupFormService.selectedName.set(value);
        if (this.signupFormService.athleteIds().length === 1) {
          this.form.controls.athleteId.setValue(
            String(this.signupFormService.athleteIds()[0])
          );
        } else {
          this.form.controls.athleteId.setValue('');
        }
      });
  }

  ngOnDestroy(): void {
    this.gymFormControlSubscription$.unsubscribe();
    this.nameFormControlSubscription$.unsubscribe();
  }
}
