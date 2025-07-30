import {
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonNote,
  IonButton,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonText,
  IonModal,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { ToastService } from 'src/app/services/toast.service';
import { apiAthleteService } from 'src/app/api/services';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { apiAutoTeamAssignmentOutput } from 'src/app/api/models';

@Component({
  selector: 'app-auto-assign-teams',
  templateUrl: './auto-assign-teams.page.html',
  styleUrls: ['./auto-assign-teams.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonModal,
    IonText,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonButton,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    IonSelect,
    IonSelectOption,
  ],
})
export class AutoAssignTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);
  athleteDataService = inject(AthleteDataService);

  dataLoaded = signal<boolean>(false);

  selectedFromTeam = signal<string | null>(null);
  selectedToTeams = signal<string[]>([]);

  openResultsModal = linkedSignal<boolean>(
    () => this.teamAssignmentResults().length > 0
  );
  teamAssignmentResults = signal<apiAutoTeamAssignmentOutput[]>([]);

  fromTeamsList = this.athleteDataService.teamNames;
  toTeamsList = computed(() =>
    this.athleteDataService
      .teamNames()
      .filter((value) => value !== this.selectedFromTeam())
  );

  constructor() {}

  handleRefresh(event: CustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.dataLoaded.set(false);
    await this.athleteDataService
      .getData()
      .then(() => this.dataLoaded.set(true));
  }

  handleFromTeamChange(event: CustomEvent) {
    this.selectedFromTeam.set(event.detail.value);
    this.selectedToTeams.set([]);
  }

  handleAutoAssign() {
    if (!this.selectedFromTeam() || this.selectedToTeams().length === 0) {
      this.toastService.showToast(
        'Please select a team to assign from and at least one team to assign to.'
      );
      return;
    }

    this.apiAthlete
      .randomAssignAthletesAthleteTeamRandomAssignPost({
        body: {
          affiliate_id: this.config.affiliateId,
          year: this.config.year,
          assign_from_team_name: this.selectedFromTeam()!,
          assign_to_team_names: this.selectedToTeams(),
        },
      })
      .subscribe({
        next: (data: apiAutoTeamAssignmentOutput[]) => {
          this.toastService.showToast('Successfully assigned athletes');
          this.teamAssignmentResults.set(data);
          this.getData();
        },
        error: (error: any) => {
          console.error('Error during auto assignment:', error);
          this.toastService.showToast(
            'Failed to auto-assign athletes. Please try again.',
            'danger'
          );
        },
      });
  }

  onDismissResultsModal() {
    this.openResultsModal.set(false);
    this.teamAssignmentResults.set([]);
  }
}
