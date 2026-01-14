import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/app-config.service';
import { apiIndividualSideScoreService } from 'src/app/api/services';
import { apiIndividualSideScoreModel } from 'src/app/api/models';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToastService } from 'src/app/services/toast.service';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-individual-side-score',
  templateUrl: './individual-side-score.page.html',
  styleUrls: ['./individual-side-score.page.scss'],
  standalone: true,
  imports: [
    IonAlert,
    IonSkeletonText,
    IonRefresherContent,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonList,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonItem,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class IndividualSideScorePage implements OnInit {
  private toastService = inject(ToastService);
  private apiIndividualSideScore = inject(apiIndividualSideScoreService);
  private appConfig = inject(AppConfigService);
  private eventService = inject(EventService);
  private athleteDataService = inject(AthleteDataService);
  private athleteNameModalService = inject(AthleteNameModalService);

  // State
  individualSideScores = signal<apiIndividualSideScoreModel[]>([]);
  dataLoaded = signal(false);
  deleteAlertOpen = signal(false);
  scoreToDelete = signal<apiIndividualSideScoreModel | null>(null);

  // Form state
  selectedOrdinal = signal<number | null>(null);
  selectedCrossfitId = signal<number | null>(null);
  selectedAthleteName = signal<string | null>(null);
  selectedScoreType = signal<'appreciation' | 'rookie'>('appreciation');
  score = signal<number | null>(null);

  // Computed
  currentYearAllEvents = this.eventService.currentYearAllEvents;
  athletes = this.athleteDataService.athleteData;
  athleteNames = computed(() => {
    const names = this.athletes().map((a) => a.name);
    return [...new Set(names)];
  });
  deleteAlertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        this.deleteAlertOpen.set(false);
      },
    },
    {
      text: 'Delete',
      role: 'confirm',
      handler: () => {
        this.deleteScore();
      },
    },
  ];

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;

    this.apiIndividualSideScore
      .getIndividualSideScoresIndividualSideScoreAffiliateIdYearGet({
        affiliate_id: affiliateId,
        year,
      })
      .subscribe({
        next: (data) => {
          this.individualSideScores.set(
            data.sort((a, b) => a.ordinal - b.ordinal)
          );
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error fetching individual side scores:', error);
          this.toastService.showToast(
            `Failed to load individual side scores${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async openAthleteSelectModal() {
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.athleteNames
      );

    if (selectedName) {
      this.selectedAthleteName.set(selectedName);

      // Find the athlete's crossfit_id
      const athlete = this.athletes().find((a) => a.name === selectedName);
      if (athlete) {
        this.selectedCrossfitId.set(athlete.crossfit_id);
      } else {
        this.toastService.showToast('Athlete not found', 'danger');
      }
    }
  }

  loadScore(individualSideScore: apiIndividualSideScoreModel) {
    this.selectedOrdinal.set(individualSideScore.ordinal);
    this.selectedCrossfitId.set(individualSideScore.crossfit_id);
    this.selectedScoreType.set(
      individualSideScore.score_type as 'appreciation' | 'rookie'
    );

    // Find and set the athlete name
    const athlete = this.athletes().find(
      (a) => a.crossfit_id === individualSideScore.crossfit_id
    );
    if (athlete) {
      this.selectedAthleteName.set(athlete.name);
    }

    this.score.set(individualSideScore.score);
  }

  confirmDelete(individualSideScore: apiIndividualSideScoreModel) {
    this.scoreToDelete.set(individualSideScore);
    this.deleteAlertOpen.set(true);
  }

  deleteScore() {
    const individualSideScore = this.scoreToDelete();
    if (!individualSideScore) return;

    this.apiIndividualSideScore
      .deleteIndividualSideScoresIndividualSideScoreDelete({
        affiliate_id: this.appConfig.affiliateId,
        year: this.appConfig.year,
        crossfit_id: individualSideScore.crossfit_id,
        ordinal: individualSideScore.ordinal,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Individual side score deleted successfully',
            'success'
          );
          this.getData();
          this.deleteAlertOpen.set(false);
          this.scoreToDelete.set(null);
        },
        error: (error) => {
          console.error('Error deleting individual side score:', error);
          this.toastService.showToast(
            `Failed to delete individual side score${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
          this.deleteAlertOpen.set(false);
        },
      });
  }

  save() {
    if (
      !this.selectedOrdinal() ||
      !this.selectedCrossfitId() ||
      this.score() === null
    ) {
      this.toastService.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.apiIndividualSideScore
      .updateIndividualSideScoresIndividualSideScorePost({
        body: {
          affiliate_id: this.appConfig.affiliateId,
          year: this.appConfig.year,
          crossfit_id: this.selectedCrossfitId()!,
          ordinal: this.selectedOrdinal()!,
          score_type: this.selectedScoreType(),
          score: this.score()!,
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Individual side score saved successfully',
            'success'
          );
          this.getData();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error saving individual side score:', error);
          this.toastService.showToast(
            `Failed to save individual side score${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
        },
      });
  }

  apply() {
    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;

    this.apiIndividualSideScore
      .applyIndividualSideScoresEndpointIndividualSideScoreApplyPost({
        affiliate_id: affiliateId,
        year: year,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Individual side scores applied successfully',
            'success'
          );
          this.getData();
        },
        error: (error) => {
          console.error('Error applying individual side scores:', error);
          this.toastService.showToast(
            `Failed to apply individual side scores${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
        },
      });
  }

  resetForm() {
    this.selectedOrdinal.set(null);
    this.selectedCrossfitId.set(null);
    this.selectedAthleteName.set(null);
    this.selectedScoreType.set('appreciation');
    this.score.set(null);
  }

  getEventName(ordinal: number): string {
    return (
      this.eventService.getEventName(ordinal, this.appConfig.year) ??
      'Unknown Event'
    );
  }

  getAthleteName(crossfitId: number): string {
    const athlete = this.athletes().find((a) => a.crossfit_id === crossfitId);
    return athlete
      ? `${athlete.name} (${athlete.team_name})`
      : 'Unknown Athlete';
  }

  test() {
    console.log(this.eventService.currentYearAllEvents());
  }
}
