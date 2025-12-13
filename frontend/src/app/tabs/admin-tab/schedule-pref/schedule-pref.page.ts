import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ItemReorderEventDetail,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonNote,
  IonLabel,
  IonButton,
  IonList,
  IonReorderGroup,
  IonItem,
  IonReorder,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { apiAthletePrefsService } from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';
import { apiAthletePrefsModel } from 'src/app/api/models';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';

@Component({
  selector: 'app-schedule-pref',
  templateUrl: './schedule-pref.page.html',
  styleUrls: ['./schedule-pref.page.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    IonReorder,
    IonItem,
    IonReorderGroup,
    IonList,
    IonButton,
    IonLabel,
    IonNote,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonRefresherContent,
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
export class SchedulePrefPage implements OnInit {
  private apiPrefs = inject(apiAthletePrefsService);
  private toastService = inject(ToastService);
  private athleteDataService = inject(AthleteDataService);
  private athleteNameModalService = inject(AthleteNameModalService);

  selectedAthleteName = signal<string | null>(null);
  selectedCrossfitId = signal<number | null>(null);

  athleteNames = computed(() =>
    this.athleteDataService.athleteData().map((a) => a.name)
  );

  prefs = signal<string[]>([]);
  private initialPrefs: string[] = [];

  dataLoaded = signal<boolean>(false);
  editPrefs = signal<boolean>(false);

  constructor() {}

  ngOnInit() {}

  handleRefresh(event: CustomEvent) {
    if (this.selectedCrossfitId()) {
      this.getAthletePrefs(this.selectedCrossfitId()!).then(() =>
        (event.target as HTMLIonRefresherElement).complete()
      );
    } else {
      (event.target as HTMLIonRefresherElement).complete();
    }
  }

  async onSelectAthlete() {
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.athleteNames
      );

    if (selectedName) {
      this.selectedAthleteName.set(selectedName);
      const crossfitId = this.athleteDataService.getCrossfitId(selectedName);
      this.selectedCrossfitId.set(crossfitId);

      if (crossfitId) {
        await this.getAthletePrefs(crossfitId);
      }
    }
  }

  async getAthletePrefs(crossfitId: number): Promise<void> {
    this.dataLoaded.set(false);
    this.apiPrefs
      .getAthletePrefsAthletePrefsCrossfitIdGet({ crossfit_id: crossfitId })
      .subscribe({
        next: (data) => {
          this.initialPrefs = data
            .sort((a, b) => a.preference_nbr - b.preference_nbr)
            .map((pref: apiAthletePrefsModel) => pref.preference);
          this.prefs.set([...this.initialPrefs]);
          this.dataLoaded.set(true);
        },
        error: () => {
          this.toastService.showToast(
            'Error fetching schedule data',
            'danger',
            null,
            3000
          );
        },
      });
  }

  handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
    this.prefs.set(event.detail.complete(this.prefs()));
  }

  onClickEdit() {
    this.editPrefs.set(true);
  }

  onClickCancel() {
    this.editPrefs.set(false);
    this.prefs.set([...this.initialPrefs]);
  }

  onClickDone() {
    if (!this.selectedCrossfitId()) return;

    this.editPrefs.set(false);
    const updatedPrefs: apiAthletePrefsModel[] = this.prefs().map(
      (pref, index) => ({
        preference: pref,
        preference_nbr: index,
      })
    );
    this.initialPrefs = [...this.prefs()];

    this.apiPrefs
      .updateAthletePrefsAthletePrefsCrossfitIdPost$Response({
        crossfit_id: this.selectedCrossfitId()!,
        body: updatedPrefs,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Preferences updated successfully',
            'success'
          );
        },
        error: (error) => {
          console.error('Error updating preferences:', error);
          this.toastService.showToast(
            'Failed to update preferences',
            'danger',
            null,
            3000
          );
        },
      });
  }
}
