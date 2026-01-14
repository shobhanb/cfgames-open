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
import { apiSidescoreService } from 'src/app/api/services';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { apiSideScoreModel } from 'src/app/api/models';

@Component({
  selector: 'app-side-scores',
  templateUrl: './side-scores.page.html',
  styleUrls: ['./side-scores.page.scss'],
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
export class SideScoresPage implements OnInit {
  private toastService = inject(ToastService);
  private apiSideScores = inject(apiSidescoreService);
  private appConfig = inject(AppConfigService);
  private eventService = inject(EventService);
  private athleteDataService = inject(AthleteDataService);

  // State
  sidescores = signal<apiSideScoreModel[]>([]);
  dataLoaded = signal(false);
  deleteAlertOpen = signal(false);
  sidescoreToDelete = signal<apiSideScoreModel | null>(null);

  // Form state
  selectedOrdinal = signal<number | null>(null);
  selectedScoreType = signal<'side_challenge' | 'spirit'>('side_challenge');
  teamName = signal('');
  score = signal<number | null>(null);

  // Computed
  currentYearAllEvents = this.eventService.currentYearAllEvents;
  teamNames = computed(() => this.athleteDataService.teamNames());
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

    this.apiSideScores
      .getSidescoresSidescoreAffiliateIdYearGet({
        affiliate_id: affiliateId,
        year,
      })
      .subscribe({
        next: (data) => {
          this.sidescores.set(data);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error fetching sidescores:', error);
          this.toastService.showToast(
            `Failed to load sidescores${
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

  loadScore(sidescore: apiSideScoreModel) {
    this.selectedOrdinal.set(sidescore.ordinal);
    this.selectedScoreType.set(
      sidescore.score_type as 'side_challenge' | 'spirit'
    );
    this.teamName.set(sidescore.team_name);
    this.score.set(sidescore.score);
  }

  confirmDelete(sidescore: apiSideScoreModel) {
    this.sidescoreToDelete.set(sidescore);
    this.deleteAlertOpen.set(true);
  }

  deleteScore() {
    const sidescore = this.sidescoreToDelete();
    if (!sidescore) return;

    const sidescoreId = sidescore.id;

    this.apiSideScores
      .deleteSidescoreSidescoreSidescoreIdDelete({
        sidescore_id: sidescoreId,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Side score deleted successfully',
            'success'
          );
          this.getData();
          this.deleteAlertOpen.set(false);
          this.sidescoreToDelete.set(null);
        },
        error: (error) => {
          console.error('Error deleting sidescore:', error);
          this.toastService.showToast(
            `Failed to delete side score${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
          this.deleteAlertOpen.set(false);
        },
      });
  }

  save() {
    if (!this.selectedOrdinal() || !this.teamName() || this.score() === null) {
      this.toastService.showToast('Please fill in all fields', 'warning');
      return;
    }

    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;

    this.apiSideScores
      .updateSidescoresSidescoreAffiliateIdYearPost({
        affiliate_id: affiliateId,
        year,
        ordinal: this.selectedOrdinal()!,
        score_type: this.selectedScoreType(),
        team_name: this.teamName(),
        score: this.score()!,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Side score saved successfully',
            'success'
          );
          this.getData();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error saving sidescore:', error);
          this.toastService.showToast(
            `Failed to save side score${
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

    this.apiSideScores
      .applySidescoresSidescoreApplyAffiliateIdYearPost({
        affiliate_id: affiliateId,
        year,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Side scores applied to teams successfully',
            'success'
          );
          this.getData();
        },
        error: (error) => {
          console.error('Error applying sidescores:', error);
          this.toastService.showToast(
            `Failed to apply side scores${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
        },
      });
  }

  resetForm() {
    this.selectedOrdinal.set(null);
    this.selectedScoreType.set('side_challenge');
    this.teamName.set('');
    this.score.set(null);
  }

  getEventName(ordinal: number): string {
    return (
      this.eventService.getEventName(ordinal, this.appConfig.year) ??
      'Unknown Event'
    );
  }
}
