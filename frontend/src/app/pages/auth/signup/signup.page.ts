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
  IonHeader,
  IonRouterLink,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { apiAthleteService, apiFireauthService } from 'src/app/api/services';
import { apiAffiliateAthlete } from 'src/app/api/models';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { CreateUserFireauthSignupPost$Params } from 'src/app/api/fn/fireauth/create-user-fireauth-signup-post';
import { ToastService } from 'src/app/services/toast.service';
import {
  Auth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { FirebaseError } from '@angular/fire/app';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { RouterLink } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonToolbar,
    IonHeader,
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
    ToolbarButtonsComponent,
    RouterLink,
    IonRouterLink,
  ],
})
export class SignupPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private apiAuth = inject(apiFireauthService);
  private fireAuth = inject(Auth);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private helperFunctions = inject(HelperFunctionsService);
  private athleteNameModalService = inject(AthleteNameModalService);
  private config = inject(AppConfigService);

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

  readonly selectedAffiliateId = this.config.affiliateId;
  readonly selectedAffiliateName = this.config.affiliateName;

  // API Data
  private athleteData = signal<apiAffiliateAthlete[]>([]);

  // Names only
  readonly athleteNames = computed<string[]>(() =>
    this.athleteData()
      .map((value: apiAffiliateAthlete) => value.name)
      .filter(this.helperFunctions.filterUnique)
  );

  async openAthleteSelectModal() {
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.athleteNames
      );

    if (selectedName) {
      this.selectedAthleteName.set(selectedName);

      this.selectedCrossfitId.set(
        this.athleteCrossfitIds().length === 1
          ? this.athleteCrossfitIds()[0]
          : null
      );
    }
  }

  // Filtered CF IDs based on selected Name
  readonly athleteCrossfitIds = computed<number[]>(() =>
    this.athleteData()
      .filter(
        (value: apiAffiliateAthlete) =>
          value.name === this.selectedAthleteName()
      )
      .map((value: apiAffiliateAthlete) => value.crossfit_id)
  );

  onAthleteCrossfitIdChange(event: CustomEvent) {
    this.selectedCrossfitId.set(event.detail.value);
  }

  assignAthleteFormValid = computed<boolean>(
    () => !!this.selectedAthleteName() && !!this.selectedCrossfitId()
  );

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

  isSignupFormValid() {
    return (
      this.selectedAffiliateId &&
      this.selectedAffiliateName &&
      this.selectedAthleteName() &&
      this.selectedCrossfitId() &&
      this.signupForm.value.email &&
      this.signupForm.value.password &&
      this.signupForm.valid &&
      this.signupForm.dirty
    );
  }

  async onSubmitSignupForm() {
    if (this.isSignupFormValid()) {
      this.loadingService.showLoading('Signing up');

      const params: CreateUserFireauthSignupPost$Params = {
        body: {
          affiliate_id: this.selectedAffiliateId,
          affiliate_name: this.selectedAffiliateName,
          display_name: this.selectedAthleteName()!,
          crossfit_id: Number(this.selectedCrossfitId()!),
          email: this.signupForm.value.email!,
          password: this.signupForm.value.password!,
        },
      };

      this.apiAuth.createUserFireauthSignupPost(params).subscribe({
        next: () => {
          this.loadingService.showLoading('Signed up. Logging in');

          const userCredential = signInWithEmailAndPassword(
            this.fireAuth,
            params.body.email,
            params.body.password
          )
            .then((value: UserCredential) => {
              this.loadingService.showLoading(
                `Logged in. Sending verification email to ${value.user.email}`
              );
              sendEmailVerification(value.user)
                .then(() => {
                  this.loadingService.dismissLoading();
                  this.toastService.showToast(
                    'Check your email for verification link',
                    'success',
                    '/',
                    3000
                  );
                })
                .catch((err: FirebaseError) => {
                  this.loadingService.dismissLoading();
                  this.toastService.showToast(
                    'Error sending verification email: ' + err.message,
                    'danger',
                    '/',
                    3000
                  );
                });
            })
            .catch((err: FirebaseError) => {
              console.error(err);
              this.loadingService.dismissLoading();
              this.toastService.showToast(
                'Error logging in: ' + err.message,
                'danger',
                '/',
                3000
              );
            });
        },
        error: (err: any) => {
          console.error(err);
          this.loadingService.dismissLoading();
          this.toastService.showToast(
            'Error signing up: ' + err.message,
            'danger',
            '/',
            3000
          );
        },
      });
    }
  }

  constructor() {}

  ngOnInit() {
    this.apiAthlete
      .getAthleteListAthleteListGet({
        affiliate_id: this.config.affiliateId,
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
          this.toastService.showToast(
            `Error getting athlete list: ${err.message}`,
            'danger',
            null,
            5000
          );
        },
      });
  }
}
