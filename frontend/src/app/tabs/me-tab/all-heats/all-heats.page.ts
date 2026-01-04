import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { AppConfigService } from '../../../services/app-config.service';
import { AthleteDataService } from '../../../services/athlete-data.service';
import { EventService } from '../../../services/event.service';
import {
  apiHeatAssignmentsService,
  apiHeatsService,
} from '../../../api/services';
import { apiHeatAssignmentModel, apiHeatsModel } from '../../../api/models';
import { ToolbarButtonsComponent } from '../../../shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-all-heats',
  templateUrl: './all-heats.page.html',
  styleUrls: ['./all-heats.page.scss'],
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonCol,
    IonRow,
    IonGrid,
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
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
    ToolbarButtonsComponent,
  ],
})
export class AllHeatsPage {
  private apiHeatAssignments = inject(apiHeatAssignmentsService);
  private apiHeats = inject(apiHeatsService);
  private athleteDataService = inject(AthleteDataService);
  private appConfig = inject(AppConfigService);
  private eventService = inject(EventService);

  // State
  heats = signal<apiHeatsModel[]>([]);
  heatAssignments = signal<apiHeatAssignmentModel[]>([]);
  selectedOrdinal = signal<number | null>(null);
  loading = signal(false);
  dataLoaded = signal(false);
  searchTerm = signal<string>('');
  shortNameFilter = signal<string>('all');

  // Computed
  currentYearEvents = this.eventService.currentYearWeekendEvents;

  // Get unique short names from heats
  uniqueShortNames = computed(() => {
    const shortNames = new Set<string>();
    this.heats().forEach((heat) => {
      if (heat.short_name) {
        shortNames.add(heat.short_name);
      }
    });
    return Array.from(shortNames).sort();
  });

  // Filter heat assignments based on search term
  filteredHeatAssignments = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.heatAssignments();

    return this.heatAssignments().filter((assignment) => {
      // Search by athlete name
      if (assignment.athlete_name?.toLowerCase().includes(search)) {
        return true;
      }

      // Search by judge name
      if (assignment.judge_name?.toLowerCase().includes(search)) {
        return true;
      }

      // Search by team name (lookup from athlete data)
      if (assignment.athlete_crossfit_id) {
        const athlete = this.athleteDataService
          .athleteData()
          .find((a) => a.crossfit_id === assignment.athlete_crossfit_id);
        if (athlete?.team_name?.toLowerCase().includes(search)) {
          return true;
        }
      }

      return false;
    });
  });

  // Get heat IDs that have filtered assignments
  filteredHeatIds = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return new Set<string>();

    return new Set(
      this.filteredHeatAssignments().map((assignment) => assignment.heat_id)
    );
  });

  // Filter heats based on short name and search
  filteredHeats = computed(() => {
    const shortNameFilter = this.shortNameFilter();
    const search = this.searchTerm().toLowerCase().trim();
    let heatsData = this.heats();

    // Filter by short name if selected
    if (shortNameFilter !== 'all') {
      heatsData = heatsData.filter(
        (heat) => heat.short_name === shortNameFilter
      );
    }

    // Only show heats that have filtered assignments when searching
    if (search) {
      heatsData = heatsData.filter((heat) =>
        this.filteredHeatIds().has(heat.id)
      );
    }

    // Only show heats that have assignments
    heatsData = heatsData.filter((heat) =>
      this.heatAssignments().some((a) => a.heat_id === heat.id)
    );

    return heatsData;
  });

  // Group heats by short_name for display
  groupedHeats = computed(() => {
    const heatsData = this.filteredHeats();
    const groups = new Map<string, apiHeatsModel[]>();

    heatsData.forEach((heat) => {
      if (!heat.short_name) return;
      if (!groups.has(heat.short_name)) {
        groups.set(heat.short_name, []);
      }
      groups.get(heat.short_name)!.push(heat);
    });

    return Array.from(groups.entries()).map(([shortName, heats]) => ({
      shortName,
      heats: heats.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ),
    }));
  });

  constructor() {
    addIcons({
      person,
    });
  }

  onEventSelect() {
    if (this.selectedOrdinal()) {
      this.shortNameFilter.set('all');
      this.loadHeats();
    }
  }

  loadHeats() {
    if (!this.selectedOrdinal()) return;

    this.loading.set(true);
    this.dataLoaded.set(false);

    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;
    const ordinal = this.selectedOrdinal()!;

    this.apiHeats
      .getHeatsByFilterHeatsFilterYearAffiliateIdOrdinalGet({
        year,
        affiliate_id: affiliateId,
        ordinal,
      })
      .subscribe({
        next: (heatsData) => {
          this.heats.set(heatsData);
          this.loadHeatAssignments();
        },
        error: (error) => {
          console.error('Error loading heats:', error.error?.detail);
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  loadHeatAssignments() {
    this.apiHeatAssignments
      .getHeatAssignmentsListHeatAssignmentsGet()
      .subscribe({
        next: (assignments) => {
          // Only show published assignments
          const publishedAssignments = assignments.filter(
            (a) => a.is_published === true
          );
          this.heatAssignments.set(publishedAssignments);
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading heat assignments:', error.error?.detail);
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  getAssignmentsForHeat(heat: apiHeatsModel): apiHeatAssignmentModel[] {
    const heatId = heat.id;
    const search = this.searchTerm().toLowerCase().trim();

    // Use filtered assignments when searching, otherwise all assignments
    const assignments = search
      ? this.filteredHeatAssignments().filter((a) => a.heat_id === heatId)
      : this.heatAssignments().filter((a) => a.heat_id === heatId);

    return assignments;
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value || '');
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.loadHeats();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  getEventName(ordinal: number): string {
    return (
      this.eventService.getWeekendEventName(ordinal, this.appConfig.year) ??
      'Unknown Event'
    );
  }
}
