import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonFab,
  IonFabButton,
  AlertController,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, pencil, add } from 'ionicons/icons';
import { apiPreferredAthletesService } from 'src/app/api/services';
import { apiPreferredAthleteModel } from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { ToastService } from 'src/app/services/toast.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { PreferredAthleteFormModalComponent } from './preferred-athlete-form-modal/preferred-athlete-form-modal.component';

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
    IonFab,
    IonFabButton,
    CommonModule,
    ToolbarButtonsComponent,
  ],
})
export class PreferredAthletesPage implements OnInit {
  private apiPreferredAthletes = inject(apiPreferredAthletesService);
  private alertController = inject(AlertController);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);
  private modalController = inject(ModalController);

  readonly preferredAthletes = signal<apiPreferredAthleteModel[]>([]);
  readonly loading = signal<boolean>(false);

  constructor() {
    addIcons({ trash, pencil, add });
  }

  ngOnInit() {
    this.loadPreferredAthletes();
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

  handleRefresh(event: RefresherCustomEvent): void {
    this.loadPreferredAthletes();
    event.target.complete();
  }

  async openAthleteForm(athlete?: apiPreferredAthleteModel) {
    const modal = await this.modalController.create({
      component: PreferredAthleteFormModalComponent,
      componentProps: {
        athlete: athlete || null,
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadPreferredAthletes();
      }
    });

    await modal.present();
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
