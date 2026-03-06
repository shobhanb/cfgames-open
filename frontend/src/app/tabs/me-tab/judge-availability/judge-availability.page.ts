import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
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
  IonButton,
} from '@ionic/angular/standalone';
import { apiJudgeAvailabilityModel } from 'src/app/api/models';
import { JudgeDataService } from 'src/app/services/judge-data.service';
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
    IonButton,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class JudgeAvailabilityPage implements OnInit {
  private judgeDataService = inject(JudgeDataService);

  // Use signals from the service
  readonly availabilities = this.judgeDataService.myJudgeAvailability;
  readonly dataLoaded = computed(
    () => !this.judgeDataService.myAvailabilityLoading(),
  );

  ngOnInit() {
    this.loadAvailabilities();
  }

  private loadAvailabilities() {
    this.judgeDataService.loadMyJudgeAvailability();
  }

  handleRefresh(event: CustomEvent) {
    this.loadAvailabilities();
    (event.target as HTMLIonRefresherElement).complete();
  }

  onAvailabilityChange(
    event: CheckboxCustomEvent,
    availability: apiJudgeAvailabilityModel,
  ) {
    const isChecked = event.detail.checked;
    this.judgeDataService.updateMyJudgeAvailability(availability.id, isChecked);
  }

  onSelectAll() {
    const avails = this.availabilities();

    avails.forEach((availability) => {
      if (!availability.available) {
        this.judgeDataService.updateMyJudgeAvailability(availability.id, true);
      }
    });
  }

  onDeselectAll() {
    const avails = this.availabilities();

    avails.forEach((availability) => {
      if (availability.available) {
        this.judgeDataService.updateMyJudgeAvailability(availability.id, false);
      }
    });
  }
}
