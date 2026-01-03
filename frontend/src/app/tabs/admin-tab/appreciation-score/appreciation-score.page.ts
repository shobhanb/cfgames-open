import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonRefresherContent,
  RefresherCustomEvent,
  IonSkeletonText,
  IonAlert,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { ToastService } from 'src/app/services/toast.service';
import { apiAppreciationScoreService } from 'src/app/api/services';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { apiAppreciationScoreModel } from 'src/app/api/models';

@Component({
  selector: 'app-appreciation-score',
  templateUrl: './appreciation-score.page.html',
  styleUrls: ['./appreciation-score.page.scss'],
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
export class AppreciationScorePage implements OnInit {
  private toastService = inject(ToastService);
  private apiAppreciationScore = inject(apiAppreciationScoreService);
  private appConfig = inject(AppConfigService);
  private eventService = inject(EventService);
  private athleteDataService = inject(AthleteDataService);

  // State
  appreciationScores = signal<apiAppreciationScoreModel[]>([]);
  dataLoaded = signal(false);
  deleteAlertOpen = signal(false);
  scoreToDelete = signal<apiAppreciationScoreModel | null>(null);

  // Form state
  selectedOrdinal = signal<number | null>(null);
  selectedCrossfitId = signal<number | null>(null);
  score = signal<number | null>(null);

  // Computed
  currentYearEvents = computed(() => this.eventService.currentYearEvents());
  athletes = computed(() => this.athleteDataService.athleteData());
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

    this.apiAppreciationScore
      .getAppreciationScoresAppreciationScoreAffiliateIdYearGet({
        affiliate_id: affiliateId,
        year,
      })
      .subscribe({
        next: (data) => {
          this.appreciationScores.set(data);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error fetching appreciation scores:', error);
          this.toastService.showToast(
            'Failed to load appreciation scores: ' + error.error?.detail,
            'danger'
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.getData();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  loadScore(appreciationScore: apiAppreciationScoreModel) {
    this.selectedOrdinal.set(appreciationScore.ordinal);
    this.selectedCrossfitId.set(appreciationScore.crossfit_id);
    this.score.set(appreciationScore.score);
  }

  confirmDelete(appreciationScore: apiAppreciationScoreModel) {
    this.scoreToDelete.set(appreciationScore);
    this.deleteAlertOpen.set(true);
  }

  deleteScore() {
    const appreciationScore = this.scoreToDelete();
    if (!appreciationScore) return;

    this.apiAppreciationScore
      .deleteAppreciationScoresAppreciationScoreCrossfitIdOrdinalDelete({
        crossfit_id: appreciationScore.crossfit_id,
        ordinal: appreciationScore.ordinal,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Appreciation score deleted successfully',
            'success'
          );
          this.getData();
          this.deleteAlertOpen.set(false);
          this.scoreToDelete.set(null);
        },
        error: (error) => {
          console.error('Error deleting appreciation score:', error);
          this.toastService.showToast(
            'Failed to delete appreciation score: ' + error.error?.detail,
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

    this.apiAppreciationScore
      .updateAppreciationScoresAppreciationScoreCrossfitIdOrdinalScorePost({
        crossfit_id: this.selectedCrossfitId()!,
        ordinal: this.selectedOrdinal()!,
        score: this.score()!,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Appreciation score saved successfully',
            'success'
          );
          this.getData();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error saving appreciation score:', error);
          this.toastService.showToast(
            'Failed to save appreciation score: ' + error.error?.detail,
            'danger'
          );
        },
      });
  }

  apply() {
    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;

    this.apiAppreciationScore
      .applyAppreciationAppreciationScoreApplyPost({
        affiliate_id: affiliateId,
        year: year,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Appreciation scores applied to teams successfully',
            'success'
          );
          this.getData();
        },
        error: (error) => {
          console.error('Error applying appreciation scores:', error);
          this.toastService.showToast(
            'Failed to apply appreciation scores: ' + error.error?.detail,
            'danger'
          );
        },
      });
  }

  resetForm() {
    this.selectedOrdinal.set(null);
    this.selectedCrossfitId.set(null);
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
}
