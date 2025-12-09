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
  IonLabel,
  IonCheckbox,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { apiAthleteDetail, apiAttendanceModel } from 'src/app/api/models';
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
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonSegmentButton,
    IonSegment,
    IonCheckbox,
    IonLabel,
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

  @Input({ required: true }) event!: EventModel;
  attendanceData = signal<apiAttendanceModel[]>([]);

  filterAttendance = signal<boolean>(false);
  searchText = signal<string | null>(null);

  filteredAttendanceData = computed(() =>
    this.filterAttendance()
      ? this.attendanceData().filter((record) => !!record.ordinal)
      : !!this.searchText()
      ? this.attendanceData().filter((value) =>
          value.name.toLowerCase().includes(this.searchText()!.toLowerCase())
        )
      : this.attendanceData()
  );

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.apiAttendance
      .getAttendanceAttendanceGet({
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

  onFilterAttendanceSelectionChanged(event: CustomEvent) {
    this.filterAttendance.set(event.detail.value);
    this.searchText.set(null);
  }

  onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
    this.filterAttendance.set(false);
  }

  onClickCheckbox(event: CustomEvent, attendanceRecord: apiAttendanceModel) {
    this.apiAttendance
      .updateAttendanceAttendanceUpdatePost({
        body: {
          crossfit_id: attendanceRecord.crossfit_id,
          year: attendanceRecord.year,
          ordinal: this.event.ordinal,
          attendance: event.detail.checked,
        },
      })
      .subscribe({
        next: (value: apiAttendanceModel) => {
          this.attendanceData.update((records) => {
            const index = records.findIndex(
              (record) =>
                record.crossfit_id === value.crossfit_id &&
                record.year === value.year
            );
            if (index !== -1) {
              records[index] = value;
            }
            return [...records];
          });
          if (this.filterAttendance()) {
            this.filterAttendance.set(false);
          }
        },
        error: (error) => {
          console.error('Error updating attendance:', error);
          this.toastService.showToast(
            'Failed to update attendance',
            'danger',
            null,
            3000
          );
        },
      });
  }
}
