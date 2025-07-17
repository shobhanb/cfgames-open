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
  IonList,
  IonItem,
  IonSkeletonText,
  IonButton,
  IonIcon,
  IonModal,
  IonLabel,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiAppreciationStatusService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';
import { apiAppreciationStatusModel, apiEventsModel } from 'src/app/api/models';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-appreciation-status',
  templateUrl: './appreciation-status.page.html',
  styleUrls: ['./appreciation-status.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonCardSubtitle,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonSkeletonText,
    IonItem,
    IonList,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonModal,
    IonLabel,
    IonFab,
    IonFabButton,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class AppreciationStatusPage implements OnInit {
  private apiAppreciationStatus = inject(apiAppreciationStatusService);
  private toastService = inject(ToastService);
  eventService = inject(EventService);

  appreciationStatus = signal<apiAppreciationStatusModel[]>([]);

  readonly availableEvents = computed<apiEventsModel[]>(() =>
    this.eventService
      .currentYearEvents()
      .filter(
        (event: apiEventsModel) =>
          !this.appreciationStatus().some(
            (status) =>
              status.year === event.year && status.ordinal === event.ordinal
          )
      )
  );

  isAddModalOpen = signal(false);
  dataLoaded = false;

  constructor() {
    addIcons({
      addOutline,
      trashOutline,
      closeOutline,
    });
  }

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiAppreciationStatus
      .getOpenAppreciationStatusAppreciationStatusGet({
        year: environment.year,
      })
      .subscribe({
        next: (data) => {
          this.appreciationStatus.set(
            data.sort((a, b) => {
              if (a.year !== b.year) {
                return b.year - a.year; // Sort by year descending
              }
              return a.ordinal - b.ordinal; // Sort by ordinal ascending
            })
          );
          this.dataLoaded = true;
        },
        error: (error) => {
          console.error('Error fetching appreciation status:', error);
          this.toastService.showToast(
            'Failed to load appreciation status',
            'danger',
            null,
            3000
          );
        },
      });
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  addEvent(event: apiEventsModel) {
    this.apiAppreciationStatus
      .addOpenAppreciationStatusAppreciationStatusPut({
        body: {
          affiliate_id: environment.affiliateId,
          year: event.year,
          ordinal: event.ordinal,
        },
      })
      .subscribe({
        next: () => {
          this.getData();
          this.toastService.showToast(
            'Appreciation event added successfully',
            'success',
            null,
            1000
          );
          this.closeAddModal();
        },
        error: (error) => {
          console.error('Error adding appreciation event:', error);
          this.toastService.showToast(
            'Failed to add appreciation event',
            'danger',
            null,
            3000
          );
        },
      });
  }

  deleteEvent(event: apiAppreciationStatusModel) {
    this.apiAppreciationStatus
      .deleteOpenAppreciationStatusAppreciationStatusDelete({
        body: event,
      })
      .subscribe({
        next: () => {
          this.getData();
          this.toastService.showToast(
            'Appreciation event removed successfully',
            'success',
            null,
            1000
          );
        },
        error: (error) => {
          console.error('Error deleting appreciation event:', error);
          this.toastService.showToast(
            'Failed to delete appreciation event',
            'danger',
            null,
            3000
          );
        },
      });
  }
}
