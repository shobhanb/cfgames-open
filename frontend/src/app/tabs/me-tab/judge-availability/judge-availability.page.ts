import {
  ChangeDetectionStrategy,
  Component,
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
  IonCheckbox,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
} from '@ionic/angular/standalone';
import { apiJudgeAvailabilityService } from 'src/app/api/services';
import { apiJudgeAvailabilityModel } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { CheckboxCustomEvent } from '@ionic/angular';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-judge-availability',
  templateUrl: './judge-availability.page.html',
  styleUrls: ['./judge-availability.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonSkeletonText,
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
    IonCheckbox,
    IonLabel,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class JudgeAvailabilityPage implements OnInit {
  private apiJudgeAvailability = inject(apiJudgeAvailabilityService);
  private toastService = inject(ToastService);

  readonly availabilities = signal<apiJudgeAvailabilityModel[]>([]);
  readonly dataLoaded = signal<boolean>(false);

  ngOnInit() {
    this.loadAvailabilities();
  }

  private loadAvailabilities() {
    this.dataLoaded.set(false);
    this.apiJudgeAvailability
      .getMyJudgeAvailabilityJudgeAvailabilityMeGet()
      .subscribe({
        next: (data) => {
          console.log(data);
          this.availabilities.set(data);
          this.dataLoaded.set(true);
        },
        error: (err) => {
          this.toastService.showToast(
            'Error loading availabilities',
            'danger',
            null,
            3000
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.loadAvailabilities();
    (event.target as HTMLIonRefresherElement).complete();
  }

  onAvailabilityChange(
    event: CheckboxCustomEvent,
    availability: apiJudgeAvailabilityModel
  ) {
    const isChecked = event.detail.checked;

    this.apiJudgeAvailability
      .updateMyJudgeAvailabilityJudgeAvailabilityMeAvailabilityIdPatch({
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
        error: (err) => {
          // Revert the checkbox state on error
          this.loadAvailabilities();
          this.toastService.showToast(
            'Error updating availability',
            'danger',
            null,
            3000
          );
        },
      });
  }
}
