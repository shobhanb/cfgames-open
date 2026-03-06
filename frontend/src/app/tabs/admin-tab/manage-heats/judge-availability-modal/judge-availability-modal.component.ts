import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonAccordionGroup,
  IonAccordion,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  school,
  close,
  statsChart,
  person,
  people,
  checkmarkCircle,
  closeCircle,
} from 'ionicons/icons';
import { apiJudgesModel } from 'src/app/api/models';
import { JudgeDataService } from 'src/app/services/judge-data.service';

export interface HeatTime {
  heatId: string;
  shortName: string;
  dateTime: string;
}

export interface JudgeInfo {
  name: string;
}

@Component({
  selector: 'app-judge-availability-modal',
  templateUrl: './judge-availability-modal.component.html',
  styleUrls: ['./judge-availability-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonAccordionGroup,
    IonAccordion,
    CommonModule,
  ],
})
export class JudgeAvailabilityModalComponent {
  private judgeDataService = inject(JudgeDataService);
  private modalController = inject(ModalController);

  // Use signals from the service
  judgeAvailabilities = this.judgeDataService.judgeAvailabilities;
  judges = this.judgeDataService.judges;
  loading = computed(
    () =>
      this.judgeDataService.judgesLoading() ||
      this.judgeDataService.availabilitiesLoading(),
  );

  // Pivot data by time slot
  pivotedByTimeSlot = computed(() => {
    const availabilities = this.judgeAvailabilities();
    const judgesData = this.judges();
    const grouped = new Map<
      string,
      { available: apiJudgesModel[]; unavailable: apiJudgesModel[] }
    >();

    // Group judges by time slot and availability (Map preserves insertion order)
    availabilities.forEach((avail) => {
      if (!grouped.has(avail.time_slot)) {
        grouped.set(avail.time_slot, { available: [], unavailable: [] });
      }

      const judge = judgesData.find((j) => j.id === avail.judge_id);
      if (judge) {
        const slot = grouped.get(avail.time_slot);
        if (slot) {
          if (avail.available) {
            slot.available.push(judge);
          } else {
            slot.unavailable.push(judge);
          }
        }
      }
    });

    // Convert to array (maintains insertion order from Map)
    return Array.from(grouped.entries()).map(([timeSlot, judges]) => ({
      timeSlot,
      availableJudges: judges.available.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      unavailableJudges: judges.unavailable.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      totalAvailable: judges.available.length,
      totalUnavailable: judges.unavailable.length,
    }));
  });

  // Get availability statistics
  stats = computed(() => {
    const availabilities = this.judgeAvailabilities();
    const totalSlots = availabilities.length;
    const availableSlots = availabilities.filter((a) => a.available).length;
    const uniqueJudges = this.judges().length;
    const uniqueTimeSlots = new Set(availabilities.map((a) => a.time_slot))
      .size;

    return {
      totalSlots,
      availableSlots,
      unavailableSlots: totalSlots - availableSlots,
      uniqueJudges,
      uniqueTimeSlots,
    };
  });

  constructor() {
    addIcons({
      school,
      close,
      statsChart,
      checkmarkCircle,
      person,
      closeCircle,
      people,
    });
    this.judgeDataService.loadJudgesAndAvailabilities();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
