import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { ApiService } from '../../../shared/data/api.service';
import { AthleteIDs } from '../../../shared/data/athlete-ids';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../shared/auth/auth.service';

function filterUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, AuthWrapperComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit, OnDestroy {
  api = inject(ApiService);
  auth = inject(AuthService);

  athleteData = signal<AthleteIDs[]>([]).asReadonly();

  gymFormControlSubscription: any;
  nameFormControlSubscription: any;

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
      this.auth.newUserGym.set(this.form.value.gym);
      this.auth.newUserName.set(this.form.value.name);
      this.auth.newUserAthleteId.set(this.form.value.athleteId);
      this.auth.uiState.set('newUserLogin');
    }
  }

  onClickCancel() {
    this.form.reset();
    this.auth.uiState.set('landing');
  }

  constructor() {
    this.athleteData = toSignal(this.api.loadAthleteIds(), {
      initialValue: [],
    });
  }

  ngOnInit(): void {
    this.gymFormControlSubscription =
      this.form.controls.gym.valueChanges.subscribe((value) => {
        this.form.controls.name.setValue('');
        this.form.controls.athleteId.setValue('');
        this.selectedGym.set(value);
      });

    this.nameFormControlSubscription =
      this.form.controls.name.valueChanges.subscribe((value) => {
        this.form.controls.athleteId.setValue('');
        this.selectedName.set(value);
      });
  }

  ngOnDestroy(): void {
    this.gymFormControlSubscription.unsubscribe();
    this.nameFormControlSubscription.unsubscribe();
  }
}
