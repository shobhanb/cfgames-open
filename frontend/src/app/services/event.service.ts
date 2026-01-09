import { computed, inject, Injectable, signal } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { apiEventsModel } from '../api/models';
import { apiCfeventsService } from '../api/services';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events = signal<apiEventsModel[]>([]);
  private allEvents = signal<apiEventsModel[]>([]);
  private config = inject(AppConfigService);
  private apiEvents = inject(apiCfeventsService);

  readonly currentYearEvents = computed(() =>
    this.events().filter((event) => event.year === this.config.year)
  );

  readonly allEventsData = computed(() => this.allEvents());

  readonly currentYearAllEvents = computed(() =>
    this.allEvents().filter((event) => event.year === this.config.year)
  );

  readonly currentYearWeekendEvents = computed<apiEventsModel[]>(() => {
    const seen = new Set<string>();
    return this.currentYearEvents()
      .filter((event) => {
        const weekend = event.event.slice(0, 4);
        if (seen.has(weekend)) return false;
        seen.add(weekend);
        return true;
      })
      .map((event) => ({ ...event, event: event.event.slice(0, 4) }));
  });

  readonly currentYearWeekendAllEvents = computed<apiEventsModel[]>(() => {
    const seen = new Set<string>();
    return this.currentYearAllEvents()
      .filter((event) => {
        const weekend = event.event.slice(0, 4);
        if (seen.has(weekend)) return false;
        seen.add(weekend);
        return true;
      })
      .map((event) => ({ ...event, event: event.event.slice(0, 4) }));
  });
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
    const event = this.allEvents().find(
      (e: apiEventsModel) => e.year === year && e.ordinal === ordinal
    );
    return event ? event.event : null;
  }

  getWeekendEventName(ordinal: number, year?: number | null): string | null {
    if (year === null) {
      year = this.config.year;
    }
    const event = this.allEvents().find(
      (e: apiEventsModel) => e.year === year && e.ordinal === ordinal
    );
    return event ? event.event.slice(0, 4) : null;
  }

  getOrdinalFromEvent(event: string): number | null {
    const [year, ordinal] = event.split('.');
    const eventModel = this.allEvents().find(
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
          this.events.set(
            events.sort((a, b) => b.year - a.year || a.ordinal - b.ordinal)
          );
        },
        error: (error) => {
          console.error('Error fetching events:', error);
        },
      });
  }

  getAllData() {
    this.apiEvents.getAllCfeventsCfeventsAllGet().subscribe({
      next: (events) => {
        this.allEvents.set(
          events.sort((a, b) => b.year - a.year || a.ordinal - b.ordinal)
        );
      },
      error: (error) => {
        console.error('Error fetching all events:', error);
      },
    });
  }

  constructor() {
    this.getData();
    this.getAllData();
  }
}
