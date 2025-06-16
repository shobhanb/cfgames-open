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

  readonly eventMap = computed(() => {
    const map = new Map<string, string>();
    this.events().forEach((event) => {
      map.set(`${event.year}-${event.ordinal}`, event.event);
    });
    return map;
  });

  readonly eventsList = computed(() =>
    this.currentYearEvents().map(
      (event) => [event.ordinal.toString(), event.event] as [string, string]
    )
  );

  getEventName(ordinal: number, year: number = environment.year): string {
    return this.eventMap().get(`${year}-${ordinal}`) || '';
  }

  initialize() {
    this.apiEvents.getCfeventsCfeventsGet().subscribe({
      next: (events) => this.events.set(events),
      error: (err) => console.error('Error loading events:', err),
    });
  }

  getEvents() {
    return this.apiEvents
      .getCfeventsCfeventsGet()
      .pipe(
        map((events) =>
          events.filter((event) => event.year === environment.year)
        )
      );
  }
}
