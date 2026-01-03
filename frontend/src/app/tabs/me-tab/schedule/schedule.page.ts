import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonReorder,
  ItemReorderEventDetail,
  IonButton,
  IonNote,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiAthletePrefsService } from 'src/app/api/services';
import { apiAthletePrefsModel } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    IonNote,
    IonButton,
    IonReorder,
    IonLabel,
    IonItem,
    IonReorderGroup,
    IonList,
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
export class SchedulePage implements OnInit {
  private apiPrefs = inject(apiAthletePrefsService);
  private toastService = inject(ToastService);

  prefs = signal<string[]>([]);
  private initialPrefs: string[] = [];

  dataLoaded = signal<boolean>(false);
  editPrefs = signal<boolean>(false);

  isNotAvailable = computed(() => this.prefs()[0] === 'NA');

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.getData().then(() =>
      (event.target as HTMLIonRefresherElement).complete()
    );
  }

  async getData(): Promise<void> {
    this.dataLoaded.set(false);
    this.apiPrefs.getMyPrefsAthletePrefsMeGet().subscribe({
      next: (data) => {
        this.initialPrefs = data
          .sort((a, b) => a.preference_nbr - b.preference_nbr)
          .map((pref: apiAthletePrefsModel) => pref.preference);
        this.prefs.set([...this.initialPrefs]);
        this.dataLoaded.set(true);
        return Promise.resolve();
      },
      error: (error) => {
        this.toastService.showToast(
          `Error fetching schedule data${
            error?.error?.detail ? ': ' + error.error.detail : ''
          }`,
          'danger',
          null,
          3000
        );
        return Promise.reject(error);
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
    this.editPrefs.set(false);
    const updatedPrefs: apiAthletePrefsModel[] = this.prefs().map(
      (pref, index) => ({
        preference: pref,
        preference_nbr: index,
      })
    );
    this.initialPrefs = [...this.prefs()];

    this.apiPrefs
      .updateMyPrefsAthletePrefsMePost({ body: updatedPrefs })
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
            `Failed to update preferences${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
            null,
            3000
          );
        },
      });
  }

  onToggleAvailability() {
    const currentPrefs = [...this.prefs()];
    const naIndex = currentPrefs.indexOf('NA');

    if (naIndex === 0) {
      // NA is at top, move to bottom
      currentPrefs.splice(0, 1);
      currentPrefs.push('NA');
    } else if (naIndex > 0) {
      // NA is somewhere else, move to top
      currentPrefs.splice(naIndex, 1);
      currentPrefs.unshift('NA');
    } else {
      // NA doesn't exist, shouldn't happen but handle gracefully
      return;
    }

    this.prefs.set(currentPrefs);
    this.initialPrefs = [...currentPrefs];

    const updatedPrefs: apiAthletePrefsModel[] = currentPrefs.map(
      (pref, index) => ({
        preference: pref,
        preference_nbr: index,
      })
    );

    this.apiPrefs
      .updateMyPrefsAthletePrefsMePost({ body: updatedPrefs })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            this.isNotAvailable()
              ? 'You are now unavailable this weekend'
              : 'You are now available this weekend',
            'success'
          );
        },
        error: (error) => {
          console.error('Error updating preferences:', error);
          this.toastService.showToast(
            `Failed to update availability${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
            null,
            3000
          );
          // Revert on error
          this.prefs.set([...this.initialPrefs]);
        },
      });
  }
}
