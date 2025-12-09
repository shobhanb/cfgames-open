import { Component, inject, linkedSignal, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  ModalController,
  IonList,
  IonItem,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonCard,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { apiAttendanceModel } from 'src/app/api/models';
import { apiAttendanceService } from 'src/app/api/services';
import { EventModel } from 'src/app/config/events';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AttendanceModalComponent } from './attendance-modal/attendance-modal.component';
import { addIcons } from 'ionicons';
import { ellipsisHorizontalOutline } from 'ionicons/icons';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonCard,
    IonText,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonItem,
    IonList,
    IonLabel,
    IonSegmentButton,
    IonSegment,
    IonRefresherContent,
    IonRefresher,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    ToolbarButtonsComponent,
  ],
})
export class AttendancePage implements OnInit {
  private config = inject(AppConfigService);
  private modalController = inject(ModalController);
  private apiAttendance = inject(apiAttendanceService);
  private toastService = inject(ToastService);
  eventService = inject(EventService);

  dataLoaded = signal<boolean>(false);

  constructor() {
    addIcons({ ellipsisHorizontalOutline });
  }

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async getData() {
    this.dataLoaded.set(false);
  }

  async openAttendanceModal(event: EventModel) {
    // Open the attendance modal for the selected event
    const modal = await this.modalController.create({
      component: AttendanceModalComponent,
      componentProps: {
        event: event,
      },
    });

    await modal.present();
  }

  async onClickApplyAttendance() {
    this.apiAttendance
      .applyAttendanceAttendanceApplyPost({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Attendance has been successfully applied to all athletes.',
            'success'
          );
        },
        error: (error) => {
          console.error('Error applying attendance:', error);
          this.toastService.showToast(
            'Error applying attendance. Please try again later.',
            'danger'
          );
        },
      });
  }
}
