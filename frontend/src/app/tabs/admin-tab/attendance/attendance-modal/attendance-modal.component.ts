import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { apiAttendanceModel } from 'src/app/api/models';
import { apiAttendanceService } from 'src/app/api/services';
import { EventModel } from 'src/app/config/events';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-attendance-modal',
  templateUrl: './attendance-modal.component.html',
  styleUrls: ['./attendance-modal.component.scss'],
  imports: [
    IonItem,
    IonList,
    IonSearchbar,
    IonContent,
    IonIcon,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
})
export class AttendanceModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private apiAttendance = inject(apiAttendanceService);
  private config = inject(AppConfigService);
  private toastService = inject(ToastService);
  private athleteData = inject(AthleteDataService);

  @Input({ required: true }) event!: EventModel;
  attendanceData = signal<apiAttendanceModel[]>([]);
  searchText = signal<string | null>(null);

  filteredAttendanceData = computed<apiAttendanceModel[]>(() =>
    !!this.searchText()
      ? this.attendanceData().filter((value: apiAttendanceModel) =>
          value.name.toLowerCase().includes(this.searchText()!.toLowerCase())
        )
      : this.attendanceData()
  );

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.apiAttendance
      .getAttendanceAttendanceAffiliateIdYearOrdinalGet({
        affiliate_id: this.config.affiliateId,
        year: this.event?.year,
        ordinal: this.event?.ordinal,
      })
      .subscribe({
        next: (data) => {
          this.attendanceData.set(
            data.sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
          );
        },
        error: (error) => {},
      });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
  }
}
