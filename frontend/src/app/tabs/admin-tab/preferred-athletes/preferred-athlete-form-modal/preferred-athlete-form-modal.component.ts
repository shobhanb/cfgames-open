import {
  Component,
  Input,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, close, search } from 'ionicons/icons';
import { apiPreferredAthletesService } from 'src/app/api/services';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ToastService } from 'src/app/services/toast.service';
import {
  apiPreferredAthleteModel,
  apiPreferredAthleteCreate,
  apiPreferredAthleteUpdate,
} from 'src/app/api/models';

@Component({
  selector: 'app-preferred-athlete-form-modal',
  templateUrl: './preferred-athlete-form-modal.component.html',
  styleUrls: ['./preferred-athlete-form-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon,
  ],
})
export class PreferredAthleteFormModalComponent {
  private modalController = inject(ModalController);
  private apiPreferredAthletes = inject(apiPreferredAthletesService);
  private athleteDataService = inject(AthleteDataService);
  private athleteNameModalService = inject(AthleteNameModalService);
  private config = inject(AppConfigService);
  private toastService = inject(ToastService);

  @Input() athlete: apiPreferredAthleteModel | null = null;

  // Form state
  athleteName = signal('');
  day = signal('Fri');
  time = signal('6AM');
  loading = signal(false);

  readonly availableAthletes = computed(() =>
    this.athleteDataService
      .athleteData()
      .map((a) => a.name)
      .sort(),
  );

  readonly dayOptions = ['Fri', 'Sat', 'Sun', 'Mon'];
  readonly timeOptions = [
    '6:00AM',
    '6:30AM',
    '7:00AM',
    '7:30AM',
    '8:00AM',
    '8:30AM',
    '9:00AM',
    '5:00PM',
    '5:30PM',
    '6:00PM',
    '6:30PM',
    '7:00PM',
    '7:30PM',
    '8:00PM',
  ];

  constructor() {
    addIcons({ search, save, close });
  }

  ngOnInit() {
    if (this.athlete) {
      this.athleteName.set(this.athlete.name);
      const [d, t] = this.athlete.start_time.split(' ');
      if (d && t) {
        this.day.set(d);
        this.time.set(t);
      }
    }
  }

  async openAthleteSelect() {
    // If editing, maybe prevent changing name? Assuming yes for now based on typical id constraints,
    // but the original code allowed it conceptually (though ID is derived from name so changing name changes ID).
    // Let's allow it as per original logic.
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.availableAthletes,
      );
    if (selectedName) {
      this.athleteName.set(selectedName);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (!this.athleteName()) return;

    this.loading.set(true);
    if (this.athlete) {
      this.updateAthlete();
    } else {
      this.createAthlete();
    }
  }

  private createAthlete() {
    const name = this.athleteName();
    const startTime = `${this.day()} ${this.time()}`;
    const crossfitId = this.athleteDataService.getCrossfitId(name);

    if (!crossfitId) {
      this.toastService.showToast('Could not find athlete ID', 'danger');
      this.loading.set(false);
      return;
    }

    const newAthlete: apiPreferredAthleteCreate = {
      affiliate_id: this.config.affiliateId,
      crossfit_id: crossfitId,
      name: name,
      start_time: startTime,
    };

    this.apiPreferredAthletes
      .createPreferredAthleteEntryPreferredAthletesPost({ body: newAthlete })
      .subscribe({
        next: () => {
          this.toastService.showToast('Athlete added', 'success');
          this.modalController.dismiss(true);
        },
        error: (error) => {
          this.handleError(error, 'Error adding athlete');
        },
      });
  }

  private updateAthlete() {
    if (!this.athlete) return;

    const name = this.athleteName();
    const startTime = `${this.day()} ${this.time()}`;
    const crossfitId = this.athleteDataService.getCrossfitId(name);

    if (!crossfitId) {
      this.toastService.showToast('Could not find athlete ID', 'danger');
      this.loading.set(false);
      return;
    }

    const update: apiPreferredAthleteUpdate = {
      crossfit_id: crossfitId,
      name: name,
      start_time: startTime,
    };

    this.apiPreferredAthletes
      .updatePreferredAthleteEntryPreferredAthletesAffiliateIdCrossfitIdPatch({
        affiliate_id: this.config.affiliateId,
        crossfit_id: this.athlete.crossfit_id, // Use original ID to find record
        body: update,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Athlete updated', 'success');
          this.modalController.dismiss(true);
        },
        error: (error) => {
          this.handleError(error, 'Error updating athlete');
        },
      });
  }

  private handleError(error: any, baseMessage: string) {
    console.error(baseMessage, error);
    this.toastService.showToast(
      `${baseMessage}${error?.error?.detail ? ': ' + error.error.detail : ''}`,
      'danger',
    );
    this.loading.set(false);
  }
}
