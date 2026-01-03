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
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSkeletonText,
  IonBadge,
  AlertController,
} from '@ionic/angular/standalone';
import { apiJudgesService } from 'src/app/api/services';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { apiJudgesModel } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { addIcons } from 'ionicons';
import {
  addCircle,
  createOutline,
  trashOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';

@Component({
  selector: 'app-judges',
  templateUrl: './judges.page.html',
  styleUrls: ['./judges.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonSkeletonText,
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonSearchbar,
    IonButton,
    IonLabel,
    IonItem,
    IonList,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JudgesPage implements OnInit {
  private apiJudge = inject(apiJudgesService);
  private athleteDataService = inject(AthleteDataService);
  private athleteNameModalService = inject(AthleteNameModalService);
  config = inject(AppConfigService);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);

  judges = signal<apiJudgesModel[]>([]);
  searchTerm = signal<string>('');
  loading = signal<boolean>(false);

  availableAthletes = computed(() => {
    const judgeIds = new Set(this.judges().map((judge) => judge.crossfit_id));
    return this.athleteDataService
      .athleteData()
      .filter((athlete) => !judgeIds.has(athlete.crossfit_id))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  availableAthleteNames = computed(() =>
    this.availableAthletes().map((a) => a.name)
  );

  filteredJudges = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.judges()
      .filter(
        (judge) =>
          judge.name.toLowerCase().includes(search) ||
          judge.crossfit_id.toString().includes(search)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  judgeCount = computed(() => this.judges().length);

  constructor() {
    addIcons({ addCircle, createOutline, trashOutline, star, starOutline });
  }

  ngOnInit() {
    this.loadJudges();
  }

  handleRefresh(event: CustomEvent) {
    this.loadJudges();
    (event.target as HTMLIonRefresherElement).complete();
  }

  loadJudges() {
    this.loading.set(true);
    this.apiJudge.getJudgesListJudgesGet().subscribe({
      next: (data) => {
        this.judges.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading judges:', error);
        this.toastService.showToast('Error loading judges', 'danger');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(event: CustomEvent) {
    this.searchTerm.set(event.detail.value || '');
  }

  async createJudge() {
    if (this.athleteDataService.loading()) {
      this.toastService.showToast(
        'Loading athletes, please try again',
        'warning'
      );
      return;
    }

    const available = this.availableAthletes();

    if (available.length === 0) {
      this.toastService.showToast('All athletes are already judges', 'warning');
      return;
    }

    const selectedName =
      await this.athleteNameModalService.openAthleteSelectModal(
        this.availableAthleteNames
      );

    if (!selectedName) {
      return;
    }

    const athlete = available.find((a) => a.name === selectedName);

    if (!athlete) {
      this.toastService.showToast('Athlete not found', 'danger');
      return;
    }

    this.apiJudge
      .createNewJudgeJudgesPost({
        body: {
          crossfit_id: athlete.crossfit_id,
          name: athlete.name,
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            `${athlete.name} added as judge`,
            'success'
          );
          this.loadJudges();
        },
        error: (error) => {
          console.error('Error creating judge:', error);
          this.toastService.showToast('Error creating judge', 'danger');
        },
      });
  }

  async createNonGymJudge() {
    const alert = await this.alertController.create({
      header: 'Add Non-Gym Judge',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Judge Name',
        },
        {
          name: 'crossfit_id',
          type: 'number',
          placeholder: 'CrossFit ID',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.name || !data.crossfit_id) {
              this.toastService.showToast('Please fill all fields', 'warning');
              return false;
            }

            this.apiJudge
              .createNewJudgeJudgesPost({
                body: {
                  crossfit_id: parseInt(data.crossfit_id),
                  name: data.name,
                },
              })
              .subscribe({
                next: () => {
                  this.toastService.showToast(
                    `${data.name} added as judge`,
                    'success'
                  );
                  this.loadJudges();
                },
                error: (error) => {
                  console.error('Error creating judge:', error);
                  this.toastService.showToast('Error creating judge', 'danger');
                },
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async updateJudge(judge: apiJudgesModel) {
    const alert = await this.alertController.create({
      header: 'Update Judge',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Judge Name',
          value: judge.name,
        },
        {
          name: 'crossfit_id',
          type: 'number',
          placeholder: 'CrossFit ID',
          value: judge.crossfit_id,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Update',
          handler: (data) => {
            if (data.name && data.crossfit_id) {
              this.apiJudge
                .updateExistingJudgeJudgesJudgeIdPatch({
                  judge_id: judge.id,
                  body: {
                    crossfit_id: parseInt(data.crossfit_id),
                  },
                })
                .subscribe({
                  next: () => {
                    this.toastService.showToast(
                      'Judge updated successfully',
                      'success'
                    );
                    this.loadJudges();
                  },
                  error: (error) => {
                    console.error('Error updating judge:', error);
                    this.toastService.showToast(
                      'Error updating judge',
                      'danger'
                    );
                  },
                });
              return true;
            }
            this.toastService.showToast('Please fill all fields', 'warning');
            return false;
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteJudge(judge: apiJudgesModel) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Delete judge ${judge.name}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiJudge
              .deleteExistingJudgeJudgesJudgeIdDelete({
                judge_id: judge.id,
              })
              .subscribe({
                next: () => {
                  this.toastService.showToast(
                    'Judge deleted successfully',
                    'success'
                  );
                  this.loadJudges();
                },
                error: (error) => {
                  console.error('Error deleting judge:', error);
                  this.toastService.showToast('Error deleting judge', 'danger');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  togglePreferred(judge: apiJudgesModel) {
    const preferred = !judge.preferred;

    this.apiJudge
      .updateExistingJudgeJudgesJudgeIdPatch({
        judge_id: judge.id,
        body: {
          preferred,
          crossfit_id: judge.crossfit_id,
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            preferred ? 'Marked as preferred' : 'Removed preferred',
            'success'
          );
          this.loadJudges();
        },
        error: (error) => {
          console.error('Error updating preferred status:', error);
          this.toastService.showToast(
            'Error updating preferred status',
            'danger'
          );
        },
      });
  }
}
