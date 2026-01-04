import {
  Component,
  computed,
  inject,
  Input,
  linkedSignal,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
import { apiAppreciationModel, apiAthleteDetail } from 'src/app/api/models';
import {
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonItem,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonList,
  IonText,
  IonLabel,
  IonBackButton,
  IonSkeletonText,
  IonTextarea,
  IonRouterLink,
  IonNote,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event.service';
import { AuthService } from 'src/app/services/auth.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiAppreciationService } from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { Router, RouterLink } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-edit-appreciation',
  templateUrl: './edit-appreciation.component.html',
  styleUrls: ['./edit-appreciation.component.scss'],
  imports: [
    IonNote,
    IonTextarea,
    IonSkeletonText,
    IonBackButton,
    IonLabel,
    IonText,
    IonList,
    IonContent,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonButton,
    IonItem,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    ToolbarButtonsComponent,
    ReactiveFormsModule,
    RouterLink,
    IonRouterLink,
  ],
})
export class EditAppreciationComponent implements OnInit {
  private authService = inject(AuthService);
  private apiAppreciationService = inject(apiAppreciationService);
  private toastService = inject(ToastService);
  private athleteNameModalService = inject(AthleteNameModalService);
  private athleteDataService = inject(AthleteDataService);
  private router = inject(Router);
  private config = inject(AppConfigService);
  eventService = inject(EventService);

  appreciation = signal<apiAppreciationModel | null>(null);

  @Input({ required: true, transform: numberAttribute }) year!: number;
  @Input({ required: true, transform: numberAttribute }) ordinal!: number;

  appreciationForm = new FormGroup({
    teamVoteText: new FormControl<string | null>(null),
    nonTeamVoteText: new FormControl<string | null>(null),
  });

  selectedTeamVoteName = linkedSignal<string | null>(() =>
    this.athleteDataService.getAthleteName(
      this.appreciation()?.team_vote_crossfit_id ?? 0
    )
  );

  selectedTeamVoteCrossfitId = linkedSignal<number | null>(() =>
    this.athleteDataService.getCrossfitId(this.selectedTeamVoteName() ?? '')
  );

  selectedNonTeamVoteName = linkedSignal<string | null>(() =>
    this.athleteDataService.getAthleteName(
      this.appreciation()?.non_team_vote_crossfit_id ?? 0
    )
  );

  selectedNonTeamVoteCrossfitId = linkedSignal<number | null>(() =>
    this.athleteDataService.getCrossfitId(this.selectedNonTeamVoteName() ?? '')
  );

  teamVoteText = computed(
    () => this.appreciationForm.get('teamVoteText')?.value ?? null
  );
  nonTeamVoteText = computed(
    () => this.appreciationForm.get('nonTeamVoteText')?.value ?? null
  );

  onClickTeamVoteName() {
    this.athleteNameModalService
      .openAthleteSelectModal(this.teamAthleteNames)
      .then((selectedAthlete) => {
        if (selectedAthlete) {
          this.selectedTeamVoteName.set(selectedAthlete);
        }
      });
    console.log('Non athlete names: ', this.teamAthleteNames());
  }

  onClickNonTeamVoteName() {
    this.athleteNameModalService
      .openAthleteSelectModal(this.nonTeamAthleteNames)
      .then((selectedAthlete) => {
        if (selectedAthlete) {
          this.selectedNonTeamVoteName.set(selectedAthlete);
        }
      });
    console.log('Non athlete names: ', this.nonTeamAthleteNames());
  }

  isFormValid() {
    return (
      this.selectedNonTeamVoteCrossfitId() !== null &&
      this.selectedNonTeamVoteCrossfitId() !== 0 &&
      this.selectedTeamVoteName() !== null &&
      this.selectedTeamVoteName() !== '' &&
      this.selectedNonTeamVoteName() !== null &&
      this.selectedNonTeamVoteName() !== ''
    );
  }

  onClickSubmit() {
    if (!this.isFormValid()) {
      this.toastService.showToast(
        'Please select both team and non-team athletes',
        'warning',
        null,
        3000
      );
      return;
    }
    this.apiAppreciationService
      .updateMyAppreciationAppreciationPost({
        body: {
          affiliate_id: this.config.affiliateId,
          year: this.year,
          ordinal: this.ordinal,
          crossfit_id: this.authService.athlete()?.crossfit_id!,
          team_vote_crossfit_id: this.selectedTeamVoteCrossfitId()!,
          team_vote_text: this.teamVoteText(),
          non_team_vote_crossfit_id: this.selectedNonTeamVoteCrossfitId()!,
          non_team_vote_text: this.nonTeamVoteText(),
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Appreciation form submitted successfully',
            'success',
            null,
            1000
          );
          this.router.navigate(['/me/appreciation']);
        },
        error: (error) => {
          console.error('Error submitting appreciation form:', error);
          this.toastService.showToast(
            `Failed to submit appreciation form${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
            null,
            3000
          );
        },
      });
  }

  readonly teamAthleteNames = computed(() =>
    this.athleteDataService
      .athleteData()
      .filter(
        (a: apiAthleteDetail) =>
          a.team_name === this.authService.athlete()?.team_name
      )
      .map((a) => a.name)
  );

  readonly nonTeamAthleteNames = computed(() =>
    this.athleteDataService
      .athleteData()
      .filter(
        (a: apiAthleteDetail) =>
          a.team_name !== this.authService.athlete()?.team_name
      )
      .map((a) => a.name)
  );

  getData() {
    this.apiAppreciationService
      .getMyAppreciationAppreciationGet({
        year: this.year,
        ordinal: this.ordinal,
      })
      .subscribe({
        next: (data: apiAppreciationModel[]) => {
          const appreciationData = data[0] || null;
          this.appreciation.set(appreciationData);

          // Initialize form controls with fetched data
          this.appreciationForm.patchValue({
            teamVoteText: appreciationData?.team_vote_text || null,
            nonTeamVoteText: appreciationData?.non_team_vote_text || null,
          });

          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error fetching appreciation data:', error);
          this.toastService.showToast(
            `Failed to load appreciation data${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
            null,
            3000
          );
        },
      });
  }

  dataLoaded = signal<boolean>(false);

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  constructor() {}

  ngOnInit() {
    this.getData();
  }
}
