import { computed, inject, Injectable, signal } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { EventModel, events } from '../config/events';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events = signal<EventModel[]>([]);
  private config = inject(AppConfigService);

  readonly currentYearEvents = computed(() =>
    this.events().filter((event) => event.year === this.config.year)
  );

  readonly baseURL = 'https://games.crossfit.com/workouts/open';

  readonly eventsLoaded = computed<boolean>(() => this.events().length > 0);

  readonly groupedEvents = computed(() => {
    const events = this.events();
    const groups: { [year: number]: EventModel[] } = {};
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
      year = this.config.year;
    }
    const event = this.events().find(
      (e: EventModel) => e.year === year && e.ordinal === ordinal
    );
    return event ? event.event : null;
  }

  getOrdinalFromEvent(event: string): number | null {
    const [year, ordinal] = event.split('.');
    const eventModel = this.events().find(
      (e: EventModel) => e.year === +year && e.event === event
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
    this.events.set(events);
  }

  constructor() {
    this.getData();
  }
}
