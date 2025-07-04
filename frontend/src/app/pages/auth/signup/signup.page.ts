import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonList,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonNote,
  IonListHeader,
} from '@ionic/angular/standalone';
import { apiAthleteService, apiFireauthService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { apiAffiliateAthlete } from 'src/app/api/models';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { AuthService } from 'src/app/services/auth.service';
import { CreateUserFireauthSignupPost$Params } from 'src/app/api/fn/fireauth/create-user-fireauth-signup-post';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonListHeader,
    IonNote,
    IonLabel,
    IonButton,
    IonList,
    IonItem,
    IonContent,
    IonInputPasswordToggle,
    IonInput,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
  ],
})
export class SignupPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private apiAuth = inject(apiFireauthService);
  private fireAuth = inject(AuthService);
  private helperFunctions = inject(HelperFunctionsService);

  // Controls the UI - show assign athlete form, or show signup email/password form
  readonly showAssignAthleteForm = signal<boolean>(true);

  // Assign Athlete Name & CF ID
  assignAthleteForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    crossfitId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  // Email & Password
  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  // Store selected Name & CF ID data
  readonly selectedAthleteName = signal<string | null>(null);
  readonly selectedCrossfitId = signal<number | null>(null);

  readonly selectedAffiliateId = environment.affiliateId;
  readonly selectedAffiliateName = environment.affiliateName;

  // API Data
  private athleteData = signal<apiAffiliateAthlete[]>([]);

  // Names only
  readonly athleteNames = computed<string[]>(() =>
    this.athleteData()
      .map((value: apiAffiliateAthlete) => value.name)
      .filter(this.helperFunctions.filterUnique)
  );

  // Filtered CF IDs based on selected Name
  readonly athleteCrossfitIds = computed<number[]>(() =>
    this.athleteData()
      .filter(
        (value: apiAffiliateAthlete) =>
          value.name === this.selectedAthleteName()
      )
      .map((value: apiAffiliateAthlete) => value.crossfit_id)
  );

  onAthleteNameChange(event: CustomEvent) {
    this.selectedAthleteName.set(event.detail.value);
    this.selectedCrossfitId.set(
      this.athleteCrossfitIds().length === 1
        ? this.athleteCrossfitIds()[0]
        : null
    );
  }

  onAthleteCrossfitIdChange(event: CustomEvent) {
    this.selectedCrossfitId.set(event.detail.value);
  }

  onSubmitAssignAthleteForm() {
    if (this.selectedAthleteName() && this.selectedCrossfitId()) {
      this.showAssignAthleteForm.set(false);
    }
  }

  onClickNotYou() {
    this.selectedAthleteName.set(null);
    this.selectedCrossfitId.set(null);
    this.showAssignAthleteForm.set(true);
  }

  onSubmitSignupForm() {
    if (
      this.selectedAffiliateId &&
      this.selectedAffiliateName &&
      this.selectedAthleteName() &&
      this.selectedCrossfitId() &&
      this.signupForm.value.email &&
      this.signupForm.value.password
    ) {
      const params: CreateUserFireauthSignupPost$Params = {
        body: {
          affiliate_id: this.selectedAffiliateId,
          affiliate_name: this.selectedAffiliateName,
          display_name: this.selectedAthleteName()!,
          crossfit_id: Number(this.selectedCrossfitId()!),
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
        },
      };
      this.fireAuth.signup(params);
    }
  }

  constructor() {}

  ngOnInit() {
    this.apiAthlete
      .getAthleteListAthleteListGet({
        affiliate_id: environment.affiliateId,
      })
      .subscribe({
        next: (value: apiAffiliateAthlete[]) => {
          this.athleteData.set(
            value.sort((a: apiAffiliateAthlete, b: apiAffiliateAthlete) => {
              if (a.name === b.name) {
                return a.crossfit_id - b.crossfit_id;
              } else {
                return a.name > b.name ? 1 : -1;
              }
            })
          );
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }
}
