import { computed, inject, Injectable, signal } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { apiEventsModel } from '../api/models';
import { apiCfeventsService } from '../api/services';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events = signal<apiEventsModel[]>([]);
  private config = inject(AppConfigService);
  private apiEvents = inject(apiCfeventsService);

  readonly currentYearEvents = computed(() =>
    this.events().filter((event) => event.year === this.config.year)
  );

  readonly baseURL = 'https://games.crossfit.com/workouts/open';

  readonly eventsLoaded = computed<boolean>(() => this.events().length > 0);

  readonly groupedEvents = computed(() => {
    const events = this.events();
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
        events: events.sort((a, b) => a.ordinal - b.ordinal),
      }))
      .sort((a, b) => b.year - a.year);
  });

  readonly eventMap = computed(() => {
    const map = new Map<string, string>();
    this.events().forEach((event) => {
      map.set(`${event.year}-${event.ordinal}`, event.event);
    });
    return map;
  });

  getEventName(ordinal: number, year?: number | null): string | null {
    if (year === null) {
      year = this.config.year;
    }
    const event = this.events().find(
      (e: apiEventsModel) => e.year === year && e.ordinal === ordinal
    );
    return event ? event.event : null;
  }

  getOrdinalFromEvent(event: string): number | null {
    const [year, ordinal] = event.split('.');
    const eventModel = this.events().find(
      (e: apiEventsModel) => e.year === +year && e.event === event
    );
    return eventModel ? eventModel.ordinal : null;
  }

  getEventCrossfitLink(event: string) {
    const [year, eventNum] = event.split('.');
    const fullYear = '20' + year;
    const cleanEventNum = eventNum.replace(/[a-zA-Z]/g, '');
    return `${this.baseURL}/${fullYear}/${cleanEventNum}`;
  }

  getData() {
    this.apiEvents
      .getEventsWithDataCfeventsGet({ affiliate_id: this.config.affiliateId })
      .subscribe({
        next: (events) => {
          this.events.set(events);
        },
        error: (error) => {
          console.error('Error fetching events:', error);
        },
      });
  }

  constructor() {
    this.getData();
  }
}
