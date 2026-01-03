import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  AlertController,
  IonIcon,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { apiCfeventsService } from 'src/app/api/services';
import {
  apiEventsModel,
  apiEventsCreate,
  apiEventsUpdate,
} from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cf-events',
  templateUrl: './cf-events.page.html',
  styleUrls: ['./cf-events.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonSearchbar,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonButton,
    IonLabel,
    IonItem,
    IonList,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSkeletonText,
    CommonModule,
    FormsModule,
  ],
})
export class CfEventsPage implements OnInit {
  private apiEvents = inject(apiCfeventsService);
  private alertController = inject(AlertController);
  private toastService = inject(ToastService);

  events = signal<apiEventsModel[]>([]);
  searchTerm = signal<string>('');
  loading = signal<boolean>(false);

  filteredEvents = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.events()
      .filter(
        (event) =>
          event.event.toLowerCase().includes(search) ||
          event.year.toString().includes(search) ||
          event.ordinal.toString().includes(search)
      )
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.ordinal - a.ordinal;
      });
  });

  groupedEvents = computed(() => {
    const events = this.filteredEvents();
    const groups: { [year: number]: apiEventsModel[] } = {};
    events.forEach((event) => {
      if (!groups[event.year]) {
        groups[event.year] = [];
      }
      groups[event.year].push(event);
    });
    return Object.entries(groups)
      .map(([year, events]) => ({
        year: +year,
        events: events.sort((a, b) => b.ordinal - a.ordinal),
      }))
      .sort((a, b) => b.year - a.year);
  });

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  ngOnInit() {
    this.loadEvents();
  }

  handleRefresh(event: CustomEvent) {
    this.loadEvents();
    (event.target as HTMLIonRefresherElement).complete();
  }

  loadEvents() {
    this.loading.set(true);
    this.apiEvents.getAllCfeventsCfeventsAllGet().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.toastService.showToast(
          `Error loading events${
            error?.error?.detail ? ': ' + error.error.detail : ''
          }`,
          'danger'
        );
        this.loading.set(false);
      },
    });
  }

  onSearchChange(event: CustomEvent) {
    this.searchTerm.set(event.detail.value || '');
  }

  async addEvent() {
    const alert = await this.alertController.create({
      header: 'Add New Event',
      inputs: [
        {
          name: 'year',
          type: 'number',
          placeholder: 'Year (e.g., 2025)',
        },
        {
          name: 'ordinal',
          type: 'number',
          placeholder: 'Ordinal (e.g., 1, 2, 3)',
        },
        {
          name: 'event',
          type: 'text',
          placeholder: 'Event name (e.g., 25.1)',
        },
        {
          name: 'start_date',
          type: 'date',
          placeholder: 'Start date (optional)',
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
            if (!data.year || !data.ordinal || !data.event) {
              this.toastService.showToast(
                'Year, ordinal, and event name are required',
                'warning'
              );
              return false;
            }
            this.createEvent({
              year: parseInt(data.year),
              ordinal: parseInt(data.ordinal),
              event: data.event,
              start_date: data.start_date || null,
            });
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  createEvent(eventData: apiEventsCreate) {
    this.apiEvents.createCfeventCfeventsPost({ body: eventData }).subscribe({
      next: () => {
        this.toastService.showToast('Event added successfully', 'success');
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.toastService.showToast(
          `Error adding event${
            error?.error?.detail ? ': ' + error.error.detail : ''
          }`,
          'danger'
        );
      },
    });
  }

  async editEvent(event: apiEventsModel) {
    const alert = await this.alertController.create({
      header: 'Edit Event',
      message: `Year: ${event.year}, Ordinal: ${event.ordinal}`,
      inputs: [
        {
          name: 'event',
          type: 'text',
          value: event.event,
          placeholder: 'Event name',
        },
        {
          name: 'start_date',
          type: 'date',
          value: event.start_date || '',
          placeholder: 'Start date (optional)',
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
            this.updateEvent(event.year, event.ordinal, {
              event: data.event || null,
              start_date: data.start_date || null,
            });
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  updateEvent(year: number, ordinal: number, updateData: apiEventsUpdate) {
    this.apiEvents
      .updateCfeventCfeventsYearOrdinalPatch({
        year,
        ordinal,
        body: updateData,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Event updated successfully', 'success');
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error updating event:', error);
          this.toastService.showToast(
            `Error updating event${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
        },
      });
  }

  async deleteEvent(event: apiEventsModel) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${event.event}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performDelete(event.year, event.ordinal);
          },
        },
      ],
    });

    await alert.present();
  }

  performDelete(year: number, ordinal: number) {
    this.apiEvents
      .deleteCfeventCfeventsYearOrdinalDelete({ year, ordinal })
      .subscribe({
        next: () => {
          this.toastService.showToast('Event deleted successfully', 'success');
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.toastService.showToast(
            `Error deleting event${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger'
          );
        },
      });
  }
}
