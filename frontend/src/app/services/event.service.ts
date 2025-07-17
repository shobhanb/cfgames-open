import { computed, inject, Injectable, signal } from '@angular/core';
import { apiCfeventsService } from '../api/services';
import { apiEventsModel } from '../api/models';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiEvents = inject(apiCfeventsService);
  private events = signal<apiEventsModel[]>([]);

  readonly currentYearEvents = computed(() =>
    this.events().filter((event) => event.year === environment.year)
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
        events: events.sort((a, b) => b.ordinal - a.ordinal),
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
      year = environment.year;
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
    this.apiEvents.getCfeventsCfeventsGet().subscribe({
      next: (events) => {
        this.events.set(
          events.sort((a: apiEventsModel, b: apiEventsModel) => {
            return b.event > a.event ? 1 : -1;
          })
        );
      },
      error: (err) => console.error('Error loading events:', err),
    });
  }

  constructor() {
    this.getData();
  }
}
