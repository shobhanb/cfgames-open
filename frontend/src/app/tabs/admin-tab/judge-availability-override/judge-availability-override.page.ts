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
  IonRefresher,
  IonRefresherContent,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonList,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonSkeletonText,
  ModalController,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import {
  apiJudgeAvailabilityService,
  apiJudgesService,
} from 'src/app/api/services';
import { apiJudgeAvailabilityModel, apiJudgesModel } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { CheckboxCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-judge-availability-override',
  templateUrl: './judge-availability-override.page.html',
  styleUrls: ['./judge-availability-override.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonSkeletonText,
    IonLabel,
    IonCheckbox,
    IonItem,
    IonList,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
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
export class JudgeAvailabilityOverridePage implements OnInit {
  private apiJudges = inject(apiJudgesService);
  private apiJudgeAvailability = inject(apiJudgeAvailabilityService);
  private toastService = inject(ToastService);
  private modalController = inject(ModalController);

  readonly judges = signal<apiJudgesModel[]>([]);
  readonly selectedJudge = signal<apiJudgesModel | null>(null);
  readonly availabilities = signal<apiJudgeAvailabilityModel[]>([]);
  readonly dataLoaded = signal<boolean>(false);

  readonly selectedJudgeName = computed(
    () => this.selectedJudge()?.name ?? null
  );

  readonly allSelected = computed(() => {
    const avails = this.availabilities();
    return avails.length > 0 && avails.every((a) => a.available);
  });

  ngOnInit() {
    this.loadJudges();
  }

  private loadJudges() {
    this.apiJudges.getJudgesListJudgesGet().subscribe({
      next: (data) => {
        this.judges.set(data.sort((a, b) => a.name.localeCompare(b.name)));
      },
      error: (error) => {
        this.toastService.showToast(
          'Error loading judges list: ' +
            (error?.error?.detail ? error.error.detail : 'Unknown error'),
          'danger',
          null,
          3000
        );
      },
    });
  }

  async onSelectJudge() {
    const judgesList = this.judges();
    if (judgesList.length === 0) {
      this.toastService.showToast('No judges available', 'warning', null, 2000);
      return;
    }

    const buttons = judgesList.map((judge) => ({
      text: judge.name,
      handler: () => {
        this.selectedJudge.set(judge);
        this.loadJudgeAvailabilities(judge.id);
      },
    }));

    buttons.push({
      text: 'Cancel',
      role: 'cancel' as const,
      handler: () => {},
    } as any);

    const actionSheet = document.createElement('ion-action-sheet');
    actionSheet.header = 'Select a Judge';
    actionSheet.buttons = buttons;
    document.body.appendChild(actionSheet);
    await actionSheet.present();
    await actionSheet.onDidDismiss();
    actionSheet.remove();
  }

  private loadJudgeAvailabilities(judgeId: string) {
    this.dataLoaded.set(false);
    this.apiJudgeAvailability
      .getJudgeAvailabilitiesListJudgeAvailabilityGet()
      .subscribe({
        next: (data) => {
          const judgeAvailabilities = data.filter(
            (avail) => avail.judge_id === judgeId
          );
          this.availabilities.set(judgeAvailabilities);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          this.toastService.showToast(
            'Error loading availabilities: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger',
            null,
            3000
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    const judge = this.selectedJudge();
    if (judge) {
      this.loadJudgeAvailabilities(judge.id);
    }
    (event.target as HTMLIonRefresherElement).complete();
  }

  onAvailabilityChange(
    event: CheckboxCustomEvent,
    availability: apiJudgeAvailabilityModel
  ) {
    const isChecked = event.detail.checked;

    this.apiJudgeAvailability
      .updateExistingJudgeAvailabilityJudgeAvailabilityAvailabilityIdPatch({
        availability_id: availability.id,
        body: {
          available: isChecked,
        },
      })
      .subscribe({
        next: (updated) => {
          this.availabilities.update((avails) =>
            avails.map((a) => (a.id === updated.id ? updated : a))
          );
          this.toastService.showToast(
            'Availability updated',
            'success',
            null,
            2000
          );
        },
        error: (error) => {
          const judge = this.selectedJudge();
          if (judge) {
            this.loadJudgeAvailabilities(judge.id);
          }
          this.toastService.showToast(
            'Error updating availability: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger',
            null,
            3000
          );
        },
      });
  }

  onToggleAll() {
    const targetState = !this.allSelected();
    const avails = this.availabilities();

    // Update all availabilities
    avails.forEach((availability) => {
      if (availability.available !== targetState) {
        this.apiJudgeAvailability
          .updateExistingJudgeAvailabilityJudgeAvailabilityAvailabilityIdPatch({
            availability_id: availability.id,
            body: {
              available: targetState,
            },
          })
          .subscribe({
            next: (updated) => {
              this.availabilities.update((avails) =>
                avails.map((a) => (a.id === updated.id ? updated : a))
              );
            },
            error: (error) => {
              this.toastService.showToast(
                'Error updating availability: ' +
                  (error?.error?.detail ? error.error.detail : 'Unknown error'),
                'danger',
                null,
                3000
              );
            },
          });
      }
    });

    this.toastService.showToast(
      targetState ? 'All slots selected' : 'All slots deselected',
      'success',
      null,
      2000
    );
  }

  onSelectAll() {
    const avails = this.availabilities();

    avails.forEach((availability) => {
      if (!availability.available) {
        this.apiJudgeAvailability
          .updateExistingJudgeAvailabilityJudgeAvailabilityAvailabilityIdPatch({
            availability_id: availability.id,
            body: {
              available: true,
            },
          })
          .subscribe({
            next: (updated) => {
              this.availabilities.update((avails) =>
                avails.map((a) => (a.id === updated.id ? updated : a))
              );
            },
            error: (error) => {
              this.toastService.showToast(
                'Error updating availability: ' +
                  (error?.error?.detail ? error.error.detail : 'Unknown error'),
                'danger',
                null,
                3000
              );
            },
          });
      }
    });

    this.toastService.showToast('All slots selected', 'success', null, 2000);
  }

  onDeselectAll() {
    const avails = this.availabilities();

    avails.forEach((availability) => {
      if (availability.available) {
        this.apiJudgeAvailability
          .updateExistingJudgeAvailabilityJudgeAvailabilityAvailabilityIdPatch({
            availability_id: availability.id,
            body: {
              available: false,
            },
          })
          .subscribe({
            next: (updated) => {
              this.availabilities.update((avails) =>
                avails.map((a) => (a.id === updated.id ? updated : a))
              );
            },
            error: (error) => {
              this.toastService.showToast(
                'Error updating availability: ' +
                  (error?.error?.detail ? error.error.detail : 'Unknown error'),
                'danger',
                null,
                3000
              );
            },
          });
      }
    });

    this.toastService.showToast('All slots deselected', 'success', null, 2000);
  }
}
