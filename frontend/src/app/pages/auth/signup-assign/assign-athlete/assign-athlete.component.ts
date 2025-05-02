import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthWrapperComponent } from '../../auth-wrapper/auth-wrapper.component';
import { SignupFormService } from '../signup-form.service';
import { AffiliateAthletes } from '../../../../shared/data/athlete-ids';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-assign-athlete',
  imports: [AuthWrapperComponent, ReactiveFormsModule],
  templateUrl: './assign-athlete.component.html',
  styleUrl: './assign-athlete.component.css',
})
export class AssignAthleteComponent {
  private router = inject(Router);
  signupFormService = inject(SignupFormService);

  athleteData = signal<AffiliateAthletes[]>([]).asReadonly();

  private gymFormControlSubscription$: any;
  private nameFormControlSubscription$: any;

  form = new FormGroup({
    gym: new FormControl('', { validators: [Validators.required] }),
    name: new FormControl('', { validators: [Validators.required] }),
    athleteId: new FormControl('', { validators: [Validators.required] }),
  });

  isFormInvalid() {
    return this.form.invalid && this.form.dirty;
  }

  onSubmit() {
    if (
      this.form.valid &&
      this.form.dirty &&
      this.form.value.gym &&
      this.form.value.name &&
      this.form.value.athleteId
    ) {
      this.signupFormService.selectedAthleteId.set(
        Number(this.form.value.athleteId)
      );
    }
  }

  onClickCancel() {
    this.form.reset();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.gymFormControlSubscription$ =
      this.form.controls.gym.valueChanges.subscribe((value) => {
        this.form.controls.name.setValue('');
        this.form.controls.athleteId.setValue('');
        this.signupFormService.selectedGym.set(value);
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
