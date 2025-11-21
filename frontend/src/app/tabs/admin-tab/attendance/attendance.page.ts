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
} from '@ionic/angular/standalone';
import { apiAttendanceModel } from 'src/app/api/models';
import { apiAttendanceService } from 'src/app/api/services';
import { EventModel } from 'src/app/config/events';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AttendanceModalComponent } from './attendance-modal/attendance-modal.component';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: true,
  imports: [
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
  eventService = inject(EventService);

  dataLoaded = signal<boolean>(false);

  constructor() {}

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
}
