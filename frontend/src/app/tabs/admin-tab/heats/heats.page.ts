import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSkeletonText,
  IonBadge,
  AlertController,
  ModalController,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import {
  apiHeatAssignmentsService,
  apiHeatsService,
  apiHeatsSetupService,
} from 'src/app/api/services';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import {
  apiEventsModel,
  apiHeatsModel,
  apiHeatsSetupModel,
} from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, addOutline } from 'ionicons/icons';
import { EditHeatConfigModalComponent } from './edit-heat-config-modal/edit-heat-config-modal.component';

@Component({
  selector: 'app-heats',
  templateUrl: './heats.page.html',
  styleUrls: ['./heats.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonSkeletonText,
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonSelectOption,
    IonSelect,
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
    ReactiveFormsModule,
    ToolbarButtonsComponent,
  ],
})
export class HeatsPage implements OnInit {
  private apiHeats = inject(apiHeatsService);
  private apiHeatsSetupService = inject(apiHeatsSetupService);
  config = inject(AppConfigService);
  eventService = inject(EventService);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  heats = signal<apiHeatsModel[]>([]);
  heatsSetup = signal<apiHeatsSetupModel[]>([]);
  selectedEvent = signal<apiEventsModel | null>(null);
  loading = signal<boolean>(false);

  groupedHeats = computed(() => {
    const heatsData = this.heats();
    const setup = this.heatsSetup();
    const event = this.selectedEvent();

    if (!event?.start_date || setup.length === 0) {
      return [];
    }

    const baseDate = new Date(event.start_date);
    const groups: Array<{
      shortName: string;
      heats: apiHeatsModel[];
      config: apiHeatsSetupModel;
    }> = [];

    setup.forEach((config) => {
      const targetDate = this.getTargetDate(baseDate, config.short_name);
      const [startHour, startMin] = config.start_time
        .substring(0, 5)
        .split(':')
        .map(Number);
      const [endHour, endMin] = config.end_time
        .substring(0, 5)
        .split(':')
        .map(Number);

      const sessionStart = new Date(targetDate);
      sessionStart.setHours(startHour, startMin, 0, 0);
      const sessionEnd = new Date(targetDate);
      sessionEnd.setHours(endHour, endMin, 59, 999);

      const heatsForConfig = heatsData.filter((heat) => {
        const heatDate = new Date(heat.start_time);
        return heatDate >= sessionStart && heatDate <= sessionEnd;
      });

      if (heatsForConfig.length > 0) {
        groups.push({
          shortName: config.short_name,
          heats: heatsForConfig.sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          ),
          config: config,
        });
      }
    });

    return groups;
  });

  constructor() {
    addIcons({ createOutline, trashOutline, addOutline });
  }

  ngOnInit() {
    this.loadHeatsSetup();
  }

  private dayRank(shortName: string): number {
    const s = shortName.toLowerCase();
    if (s.includes('thu')) return 0; // Thurs
    if (s.includes('fri')) return 1; // Fri
    if (s.includes('sat')) return 2; // Sat
    if (s.includes('sun')) return 3; // Sun
    return 99; // unknowns last
  }

  private sessionRank(shortName: string, startTime?: string): number {
    const s = shortName.toLowerCase();
    if (s.includes('am')) return 0;
    if (s.includes('pm')) return 1;
    if (startTime) {
      const hour = parseInt(startTime.substring(0, 2), 10);
      if (!Number.isNaN(hour)) {
        return hour < 12 ? 0 : 1;
      }
    }
    return 2; // unknown session after AM/PM
  }

  private sortHeatsSetup(a: apiHeatsSetupModel, b: apiHeatsSetupModel): number {
    const dayA = this.dayRank(a.short_name || '');
    const dayB = this.dayRank(b.short_name || '');
    if (dayA !== dayB) return dayA - dayB;

    const sessA = this.sessionRank(a.short_name || '', a.start_time);
    const sessB = this.sessionRank(b.short_name || '', b.start_time);
    if (sessA !== sessB) return sessA - sessB;

    // Tiebreaker: earlier start time first
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return 0;
  }

  loadHeatsSetup() {
    this.apiHeatsSetupService
      .getHeatsSetupByAffiliateIdHeatsSetupAffiliateAffiliateIdGet({
        affiliate_id: this.config.affiliateId,
      })
      .subscribe({
        next: (data) => {
          const sorted = [...data].sort((a, b) => this.sortHeatsSetup(a, b));
          this.heatsSetup.set(sorted);
          console.log(data);
        },
        error: (error) => {
          console.error('Error loading heats setup:', error);
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    this.loadHeats();
    (event.target as HTMLIonRefresherElement).complete();
  }

  loadHeats() {
    if (!this.selectedEvent()) {
      return;
    }

    this.loading.set(true);
    this.apiHeats
      .getHeatsByFilterHeatsFilterYearAffiliateIdOrdinalGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
        ordinal: this.selectedEvent()!.ordinal,
      })
      .subscribe({
        next: (data) => {
          const filtered = data.filter(
            (heat) =>
              heat.year === this.config.year &&
              heat.ordinal === this.selectedEvent()!.ordinal
          );
          this.heats.set(filtered);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading heats:', error);
          this.toastService.showToast('Error loading heats', 'danger');
          this.loading.set(false);
        },
      });
  }

  onEventChange() {
    this.loadHeats();
  }

  generateHeats() {
    if (!this.selectedEvent()) {
      this.toastService.showToast('Please select an event first', 'warning');
      return;
    }

    const setup = this.heatsSetup();
    if (setup.length === 0) {
      this.toastService.showToast(
        'No heat setup found for this affiliate',
        'warning'
      );
      return;
    }

    const eventStartDate = this.selectedEvent()!.start_date;
    if (!eventStartDate) {
      this.toastService.showToast(
        'Event has no start date configured',
        'danger'
      );
      return;
    }

    this.apiHeats
      .generateHeatsFromSetupHeatsGeneratePost({
        year: this.config.year,
        affiliate_id: this.config.affiliateId,
        ordinal: this.selectedEvent()!.ordinal,
      })
      .subscribe({
        next: (heats) => {
          this.toastService.showToast(
            `${heats.length} heats created successfully`,
            'success'
          );
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error generating heats:', error);
          this.toastService.showToast('Error generating heats', 'danger');
        },
      });
  }

  getTargetDate(baseDate: Date, shortName: string): Date {
    const dayOfWeek = baseDate.getDay();
    const name = shortName.toLowerCase();

    let targetDay: number;
    if (name.includes('fri')) {
      targetDay = 5;
    } else if (name.includes('sat')) {
      targetDay = 6;
    } else if (name.includes('sun')) {
      targetDay = 0;
    } else if (name.includes('thu')) {
      targetDay = 4;
    } else if (name.includes('mon')) {
      targetDay = 1;
    } else if (name.includes('tue')) {
      targetDay = 2;
    } else if (name.includes('wed')) {
      targetDay = 3;
    } else {
      targetDay = 5;
    }

    let daysToAdd = targetDay - dayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }

    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + daysToAdd);
    return targetDate;
  }

  async editHeat(heat: apiHeatsModel) {
    const alert = await this.alertController.create({
      header: 'Edit Heat',
      inputs: [
        {
          name: 'startTime',
          type: 'datetime-local',
          value: new Date(heat.start_time).toISOString().slice(0, 16),
          label: 'Start Time',
        },
        {
          name: 'maxAthletes',
          type: 'number',
          value: heat.max_athletes || 10,
          label: 'Max Athletes',
          min: 1,
          max: 50,
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
            this.updateHeat(heat, data);
          },
        },
      ],
    });

    await alert.present();
  }

  updateHeat(heat: apiHeatsModel, data: any) {
    const newStartTime = new Date(data.startTime).toISOString();

    this.apiHeats
      .updateExistingHeatHeatsYearAffiliateIdOrdinalStartTimePatch({
        year: heat.year,
        affiliate_id: heat.affiliate_id,
        ordinal: heat.ordinal,
        start_time: heat.start_time,
        body: {
          start_time: newStartTime,
          max_athletes: parseInt(data.maxAthletes),
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Heat updated successfully', 'success');
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error updating heat:', error);
          this.toastService.showToast('Error updating heat', 'danger');
        },
      });
  }

  async deleteHeat(heat: apiHeatsModel) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Delete heat at ${new Date(heat.start_time).toLocaleString()}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performDelete(heat);
          },
        },
      ],
    });

    await alert.present();
  }

  performDelete(heat: apiHeatsModel) {
    this.apiHeats
      .deleteExistingHeatHeatsYearAffiliateIdOrdinalStartTimeDelete({
        year: heat.year,
        affiliate_id: heat.affiliate_id,
        ordinal: heat.ordinal,
        start_time: heat.start_time,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Heat deleted successfully', 'success');
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error deleting heat:', error);
          this.toastService.showToast('Error deleting heat', 'danger');
        },
      });
  }

  async deleteAllHeats() {
    if (this.heats().length === 0) return;

    const alert = await this.alertController.create({
      header: 'Confirm Delete All',
      message: `Delete all ${this.heats().length} heats for ${
        this.selectedEvent()!.event
      }?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete All',
          role: 'destructive',
          handler: () => {
            this.apiHeats
              .deleteHeatsBulkHeatsBulkDelete({
                year: this.config.year,
                affiliate_id: this.config.affiliateId,
                ordinal: this.selectedEvent()!.ordinal,
              })
              .subscribe({
                next: (result) => {
                  const deletedCount = result['deleted_count'] || 0;
                  this.toastService.showToast(
                    `All ${deletedCount} heats deleted successfully`,
                    'success'
                  );
                  this.loadHeats();
                },
                error: (error) => {
                  console.error('Error deleting heats:', error);
                  this.toastService.showToast('Error deleting heats', 'danger');
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async editHeatConfig(config: apiHeatsSetupModel) {
    const modal = await this.modalController.create({
      component: EditHeatConfigModalComponent,
      componentProps: {
        config: config,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.updateHeatConfig(config, data);
    }
  }

  updateHeatConfig(config: apiHeatsSetupModel, data: any) {
    this.apiHeatsSetupService
      .updateExistingHeatsSetupHeatsSetupHeatIdPatch({
        heat_id: config.id!,
        body: {
          start_time: data.startTime + ':00',
          end_time: data.endTime + ':00',
          interval: parseInt(data.interval),
          max_athletes: parseInt(data.maxAthletes),
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Heat configuration updated successfully',
            'success'
          );
          this.loadHeatsSetup();
        },
        error: (error: any) => {
          console.error('Error updating heat configuration:', error);
          this.toastService.showToast(
            'Error updating heat configuration',
            'danger'
          );
        },
      });
  }
}
