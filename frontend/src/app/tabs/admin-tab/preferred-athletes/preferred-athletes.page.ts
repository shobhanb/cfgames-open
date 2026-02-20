import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFab,
  IonFabButton,
  AlertController,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, pencil, add, save, close } from 'ionicons/icons';
import { apiPreferredAthletesService } from 'src/app/api/services';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import {
  apiPreferredAthleteModel,
  apiPreferredAthleteCreate,
  apiPreferredAthleteUpdate,
} from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { ToastService } from 'src/app/services/toast.service';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-preferred-athletes',
  templateUrl: './preferred-athletes.page.html',
  styleUrls: ['./preferred-athletes.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonFab,
    IonFabButton,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    IonInput,
  ],
})
export class PreferredAthletesPage implements OnInit {
  private apiPreferredAthletes = inject(apiPreferredAthletesService);
  private alertController = inject(AlertController);
  private athleteNameModalService = inject(AthleteNameModalService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);
  athleteDataService = inject(AthleteDataService);

  readonly preferredAthletes = signal<apiPreferredAthleteModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly showAddForm = signal<boolean>(false);

  // Form state
  readonly newAthleteName = signal<string>('');
  readonly newDay = signal<string>('Fri');
  readonly newTime = signal<string>('6AM');
  readonly editName = signal<string>('');
  readonly editDay = signal<string>('');
  readonly editTime = signal<string>('');

  readonly availableAthletes = computed(() =>
    this.athleteDataService
      .athleteData()
      .map((a) => a.name)
      .sort(),
  );

  readonly dayOptions = ['Fri', 'Sat', 'Sun', 'Mon'];

  readonly timeOptions = [
    '5:45AM',
    '6:00AM',
    '6:30AM',
    '7:00AM',
    '7:30AM',
    '8:00AM',
    '8:30AM',
    '9:00AM',
    '9:30AM',
    '10:00AM',
    '5:00PM',
    '5:30PM',
    '6:00PM',
    '6:30PM',
    '7:00PM',
    '7:30PM',
    '8:00PM',
  ];

  constructor() {
    addIcons({ trash, pencil, add, save, close });
  }

  ngOnInit() {
    this.loadPreferredAthletes();
  }

  private getErrorMessage(error: any, baseMessage: string): string {
    if (error?.error) {
      const detail =
        error.error.detail ||
        (typeof error.error === 'object'
          ? JSON.stringify(error.error)
          : error.error);
      return `${baseMessage}: ${detail}`;
    }
    return baseMessage;
  }

  loadPreferredAthletes(): void {
    this.loading.set(true);
    this.apiPreferredAthletes
      .listPreferredAthletesPreferredAthletesAffiliateIdGet({
        affiliate_id: this.config.affiliateId,
      })
      .subscribe({
        next: (data) => {
          this.preferredAthletes.set(
            data.sort((a, b) => a.name.localeCompare(b.name)),
          );
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading preferred athletes:', error);
          this.toastService.showToast(
            `Error loading preferred athletes${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
          );
          this.loading.set(false);
        },
      });
  }

  handleRefresh(event: any): void {
    this.loadPreferredAthletes();
    event.target.complete();
  }

  async openAthleteModal(): Promise<void> {
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.availableAthletes,
      );
    if (selectedName) {
      this.newAthleteName.set(selectedName);
    }
  }

  async openEditAthleteModal(): Promise<void> {
    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.availableAthletes,
      );
    if (selectedName) {
      this.editName.set(selectedName);
    }
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (this.showAddForm()) {
      this.newAthleteName.set('');
      this.newDay.set('Fri');
      this.newTime.set('6AM');
    }
  }

  addAthlete(): void {
    const name = this.newAthleteName();
    const startTime = `${this.newDay()} ${this.newTime()}`;
    const crossfitId = this.athleteDataService.getCrossfitId(name);

    if (!name || !crossfitId) {
      return;
    }

    const newAthlete: apiPreferredAthleteCreate = {
      affiliate_id: this.config.affiliateId,
      crossfit_id: crossfitId,
      name: name,
      start_time: startTime,
    };

    this.loading.set(true);
    this.apiPreferredAthletes
      .createPreferredAthleteEntryPreferredAthletesPost({ body: newAthlete })
      .subscribe({
        next: () => {
          this.loadPreferredAthletes();
          this.toggleAddForm();
        },
        error: (error) => {
          console.error('Error adding athlete:', error);
          this.toastService.showToast(
            `Error adding athlete${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
          );
          this.loading.set(false);
        },
      });
  }

  startEdit(athlete: apiPreferredAthleteModel): void {
    this.editingId.set(athlete.id);
    this.editName.set(athlete.name);
    const [day, time] = athlete.start_time.split(' ');
    this.editDay.set(day);
    this.editTime.set(time);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editName.set('');
    this.editDay.set('');
    this.editTime.set('');
  }

  saveEdit(athlete: apiPreferredAthleteModel): void {
    const name = this.editName();
    const startTime = `${this.editDay()} ${this.editTime()}`;
    const crossfitId = this.athleteDataService.getCrossfitId(name);

    if (!crossfitId) {
      return;
    }

    const update: apiPreferredAthleteUpdate = {
      crossfit_id: crossfitId,
      name: name,
      start_time: startTime,
    };

    this.loading.set(true);
    this.apiPreferredAthletes
      .updatePreferredAthleteEntryPreferredAthletesAffiliateIdCrossfitIdPatch({
        affiliate_id: this.config.affiliateId,
        crossfit_id: athlete.crossfit_id,
        body: update,
      })
      .subscribe({
        next: () => {
          this.loadPreferredAthletes();
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating athlete:', error);
          this.toastService.showToast(
            `Error updating athlete${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
          );
          this.loading.set(false);
        },
      });
  }

  async deleteAthlete(athlete: apiPreferredAthleteModel): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to remove ${athlete.name} from the preferred list?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.loading.set(true);
            this.apiPreferredAthletes
              .deletePreferredAthleteEntryPreferredAthletesAffiliateIdCrossfitIdDelete(
                {
                  affiliate_id: this.config.affiliateId,
                  crossfit_id: athlete.crossfit_id,
                },
              )
              .subscribe({
                next: () => {
                  this.loadPreferredAthletes();
                },
                error: (error) => {
                  console.error('Error deleting athlete:', error);
                  this.toastService.showToast(
                    `Error deleting athlete${
                      error?.error?.detail ? ': ' + error.error.detail : ''
                    }`,
                    'danger',
                  );
                  this.loading.set(false);
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }
}
