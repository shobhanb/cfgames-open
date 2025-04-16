import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../../shared/data/api.service';
import { AuthService } from '../../../shared/auth/auth.service';
import { AthleteIDs } from '../../../shared/data/athlete-ids';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { Router } from '@angular/router';

function filterUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}
@Component({
  selector: 'app-assign-athlete',
  imports: [AuthWrapperComponent, ReactiveFormsModule],
  templateUrl: './assign-athlete.component.html',
  styleUrl: './assign-athlete.component.css',
})
export class AssignAthleteComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);

  athleteData = signal<AthleteIDs[]>([]).asReadonly();

  gymFormControlSubscription$: any;
  nameFormControlSubscription$: any;

  selectedGym = signal<string | null>(null);
  selectedName = signal<string | null>(null);

  gyms = computed<string[]>(() =>
    this.athleteData()
      .map((athlete) => athlete.gym)
      .filter(filterUnique)
      .sort()
  );

  names = computed<string[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.gym === this.selectedGym())
      .map((athlete) => athlete.name)
      .filter(filterUnique)
      .sort()
  );

  athleteIds = computed<number[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.gym === this.selectedGym())
      .filter((athlete) => athlete.name === this.selectedName())
      .map((athlete) => athlete.athleteId)
      .sort()
  );

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
      if (!this.auth.user()) {
        console.log('User not signed in. Redirect to login');
        this.router.navigateByUrl('auth/login');
      }
      this.auth.assignAthleteIds(this.form.value.athleteId);
      this.router.navigateByUrl('/home');
    }
  }

  onClickCancel() {
    this.form.reset();
    this.router.navigateByUrl('/home');
  }

  constructor() {
    this.athleteData = toSignal(this.api.loadAthleteIds(), {
      initialValue: [],
    });
  }

  ngOnInit(): void {
    this.gymFormControlSubscription$ =
      this.form.controls.gym.valueChanges.subscribe((value) => {
        this.form.controls.name.setValue('');
        this.form.controls.athleteId.setValue('');
        this.selectedGym.set(value);
      });

    this.nameFormControlSubscription$ =
      this.form.controls.name.valueChanges.subscribe((value) => {
        this.form.controls.athleteId.setValue('');
        this.selectedName.set(value);
      });
  }

  ngOnDestroy(): void {
    this.gymFormControlSubscription$.unsubscribe();
    this.nameFormControlSubscription$.unsubscribe();
  }
}
