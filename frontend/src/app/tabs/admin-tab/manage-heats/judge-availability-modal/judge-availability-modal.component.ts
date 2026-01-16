import { Component, inject, signal, computed } from '@angular/core';
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
import {
  apiJudgeAvailabilityService,
  apiJudgesService,
} from 'src/app/api/services';
import { apiJudgeAvailabilityModel, apiJudgesModel } from 'src/app/api/models';
import { AppConfigService } from 'src/app/services/app-config.service';
import { forkJoin } from 'rxjs';

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
  private apiJudgeAvailability = inject(apiJudgeAvailabilityService);
  private apiJudges = inject(apiJudgesService);
  private config = inject(AppConfigService);
  private modalController = inject(ModalController);

  judgeAvailabilities = signal<apiJudgeAvailabilityModel[]>([]);
  judges = signal<apiJudgesModel[]>([]);
  loading = signal(true);

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
        a.name.localeCompare(b.name)
      ),
      unavailableJudges: judges.unavailable.sort((a, b) =>
        a.name.localeCompare(b.name)
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
    this.loadJudgeAvailability();
  }

  private loadJudgeAvailability() {
    this.loading.set(true);

    // Fetch both judge availabilities and judges list
    forkJoin({
      availabilities:
        this.apiJudgeAvailability.getJudgeAvailabilitiesListJudgeAvailabilityGet(),
      judges: this.apiJudges.getJudgesListJudgesAllGet({
        affiliate_id: this.config.affiliateId,
      }),
    }).subscribe({
      next: (data) => {
        this.judgeAvailabilities.set(data.availabilities);
        this.judges.set(data.judges);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading judge data:', error);
        this.loading.set(false);
      },
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
