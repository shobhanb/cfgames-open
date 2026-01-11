import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonPopover,
  IonSearchbar,
  PopoverController,
  AlertController,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import {
  apiAthletePrefsService,
  apiHeatAssignmentsService,
  apiHeatsService,
} from 'src/app/api/services';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AthleteNameModalService } from 'src/app/services/athlete-name-modal.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import {
  apiHeatsModel,
  apiHeatAssignmentModel,
  apiAthletePrefsOutputModel,
  apiAssignAthletesResponse,
} from 'src/app/api/models';
import { JudgeSummaryModalComponent } from './judge-summary-modal/judge-summary-modal.component';
import { UnassignedAthletesModalComponent } from './unassigned-athletes-modal/unassigned-athletes-modal.component';
import { AthletePrefsModalComponent } from './athlete-prefs-modal/athlete-prefs-modal.component';
import { JudgeAvailabilityModalComponent } from './judge-availability-modal/judge-availability-modal.component';
import { addIcons } from 'ionicons';
import {
  add,
  close,
  cloudDoneOutline,
  cloudOfflineOutline,
  createOutline,
  lockClosedOutline,
  lockOpenOutline,
  person,
  school,
  shuffle,
  statsChartOutline,
  trash,
} from 'ionicons/icons';

@Component({
  selector: 'app-manage-heats',
  templateUrl: './manage-heats.page.html',
  styleUrls: ['./manage-heats.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonCol,
    IonRow,
    IonGrid,
    IonSpinner,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
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
    IonPopover,
    IonSearchbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class ManageHeatsPage implements OnInit {
  private apiHeatAssignments = inject(apiHeatAssignmentsService);
  private apiHeats = inject(apiHeatsService);
  private athleteDataService = inject(AthleteDataService);
  private athleteNameModal = inject(AthleteNameModalService);
  private appConfig = inject(AppConfigService);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private apiAthletePrefs = inject(apiAthletePrefsService);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  // State
  heats = signal<apiHeatsModel[]>([]);
  heatAssignments = signal<apiHeatAssignmentModel[]>([]);
  athletePrefs = signal<apiAthletePrefsOutputModel[]>([]);
  selectedOrdinal = signal<number | null>(null);
  loading = signal(false);
  dataLoaded = signal(false);
  hoveredJudgeName = signal<string | null>(null);
  searchTerm = signal<string>('');

  // Computed
  currentYearEvents = this.eventService.currentYearWeekendAllEvents;

  athleteNames = computed(() =>
    this.athleteDataService.athleteData().map((a) => a.name)
  );
  judgeNames = computed(() =>
    this.athleteDataService
      .athleteData()
      .filter((a) => a.judge)
      .map((a) => a.name)
  );

  // Filter heat assignments based on search term
  filteredHeatAssignments = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.heatAssignments();

    return this.heatAssignments().filter((assignment) => {
      const athleteMatch = assignment.athlete_name
        ?.toLowerCase()
        .includes(search);
      const judgeMatch = assignment.judge_name?.toLowerCase().includes(search);
      return athleteMatch || judgeMatch;
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

  // Get athlete IDs that are assigned to multiple heats
  duplicateAthleteIds = computed(() => {
    const athleteCounts = new Map<number, number>();
    const currentHeatIds = new Set(this.heats().map((h) => h.id));

    // Count assignments per athlete, only for current event's heats
    this.heatAssignments().forEach((assignment) => {
      if (
        assignment.athlete_crossfit_id &&
        currentHeatIds.has(assignment.heat_id)
      ) {
        const count = athleteCounts.get(assignment.athlete_crossfit_id) || 0;
        athleteCounts.set(assignment.athlete_crossfit_id, count + 1);
      }
    });

    // Return set of IDs that appear more than once
    const duplicates = new Set<number>();
    athleteCounts.forEach((count, athleteId) => {
      if (count > 1) {
        duplicates.add(athleteId);
      }
    });

    return duplicates;
  });

  // Group heats by short_name for display
  groupedHeats = computed(() => {
    const heatsData = this.heats();
    const search = this.searchTerm().toLowerCase().trim();
    const groups = new Map<string, apiHeatsModel[]>();

    // If searching, only include heats with matching assignments
    const filteredHeats = search
      ? heatsData.filter((heat) => this.filteredHeatIds().has(heat.id))
      : heatsData;

    filteredHeats.forEach((heat) => {
      const existing = groups.get(heat.short_name) || [];
      existing.push(heat);
      groups.set(heat.short_name, existing);
    });

    return Array.from(groups.entries()).map(([shortName, heats]) => ({
      shortName,
      heats: heats.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ),
    }));
  });

  // Get unassigned athletes for the current event
  unassignedAthletes = computed(() => {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    const assignedAthleteIds = new Set(
      this.heatAssignments()
        .filter(
          (a) => currentHeatIds.has(a.heat_id) && a.athlete_crossfit_id !== null
        )
        .map((a) => a.athlete_crossfit_id)
    );

    return this.athleteDataService
      .athleteData()
      .filter((athlete) => !assignedAthleteIds.has(athlete.crossfit_id))
      .map((athlete) => ({
        name: athlete.name,
        preferences: this.getAthletePreferences(athlete.crossfit_id),
      }));
  });

  // Assignment statistics
  totalAthletesAssigned = computed(() => {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    const uniqueAthleteIds = new Set(
      this.heatAssignments()
        .filter((a) => currentHeatIds.has(a.heat_id) && a.athlete_crossfit_id)
        .map((a) => a.athlete_crossfit_id)
    );
    return uniqueAthleteIds.size;
  });

  totalJudgesAssigned = computed(() => {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    const uniqueJudgeIds = new Set(
      this.heatAssignments()
        .filter((a) => currentHeatIds.has(a.heat_id) && a.judge_crossfit_id)
        .map((a) => a.judge_crossfit_id)
    );
    return uniqueJudgeIds.size;
  });

  assignmentsWithoutAthletes = computed(() => {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    return this.heatAssignments().filter(
      (a) => currentHeatIds.has(a.heat_id) && !a.athlete_crossfit_id
    ).length;
  });

  assignmentsWithoutJudges = computed(() => {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    return this.heatAssignments().filter(
      (a) => currentHeatIds.has(a.heat_id) && !a.judge_crossfit_id
    ).length;
  });

  constructor() {
    addIcons({
      add,
      close,
      cloudDoneOutline,
      cloudOfflineOutline,
      createOutline,
      lockClosedOutline,
      lockOpenOutline,
      person,
      school,
      shuffle,
      statsChartOutline,
      trash,
    });
  }

  private heatsWithAssignments(): apiHeatsModel[] {
    return this.heats().filter((heat) =>
      this.heatAssignments().some((a) => a.heat_id === heat.id)
    );
  }

  hasAnyAssignments(): boolean {
    return this.heatsWithAssignments().length > 0;
  }

  allHeatsLocked(): boolean {
    const heatsWithAssignments = this.heatsWithAssignments();
    if (heatsWithAssignments.length === 0) return false;
    return heatsWithAssignments.every(
      (heat) => this.getAssignmentsForHeat(heat)[0]?.is_locked === true
    );
  }

  allHeatsPublished(): boolean {
    const heatsWithAssignments = this.heatsWithAssignments();
    if (heatsWithAssignments.length === 0) return false;
    return heatsWithAssignments.every(
      (heat) => this.getAssignmentsForHeat(heat)[0]?.is_published === true
    );
  }

  ngOnInit() {}

  onEventSelect() {
    if (this.selectedOrdinal()) {
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
          console.error('Error loading heats:', error);
          this.toastService.showToast(
            'Failed to load heats: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
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
          this.heatAssignments.set(assignments);
          this.loadAthletePrefs();
        },
        error: (error) => {
          console.error('Error loading heat assignments:', error);
          this.toastService.showToast(
            'Failed to load heat assignments: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  assignAthletes() {
    if (!this.selectedOrdinal()) {
      this.toastService.showToast('Select an event first', 'warning');
      return;
    }

    this.loading.set(true);
    this.dataLoaded.set(false);

    const affiliate_id = this.appConfig.affiliateId;
    const year = this.appConfig.year;
    const ordinal = this.selectedOrdinal()!;

    this.apiHeatAssignments
      .assignAthletesHeatAssignmentsAssignAthletesPost({
        body: { affiliate_id, year, ordinal },
      })
      .subscribe({
        next: async (result: apiAssignAthletesResponse) => {
          await this.showAssignmentResults(result);
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error assigning athletes:', error);
          this.toastService.showToast(
            'Failed to assign athletes: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  assignJudges() {
    if (!this.selectedOrdinal()) {
      this.toastService.showToast('Select an event first', 'warning');
      return;
    }

    this.loading.set(true);
    this.dataLoaded.set(false);

    const affiliate_id = this.appConfig.affiliateId;
    const year = this.appConfig.year;
    const ordinal = this.selectedOrdinal()!;

    this.apiHeatAssignments
      .assignJudgesHeatAssignmentsAssignJudgesPost({
        body: { affiliate_id, year, ordinal },
      })
      .subscribe({
        next: async (result) => {
          await this.showAssignmentResults(result);
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error assigning judges:', error);
          this.toastService.showToast(
            'Failed to assign judges: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  async showAssignmentResults(result: any) {
    const skippedCount = result.skipped_athletes?.length ?? 0;
    let message = `Assignment Complete!

Heats Processed: ${result.heats_processed || 0}
Athletes Assigned: ${result.athletes_assigned || 0}
Judges Assigned: ${result.judges_assigned || 0}`;

    if (skippedCount > 0) {
      message += `\n\nSkipped Athletes: ${skippedCount}`;
    }

    const alert = await this.alertController.create({
      header: 'Random Assignment Results',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async deleteAllUnlockedAssignments() {
    if (!this.selectedOrdinal()) {
      this.toastService.showToast('Select an event first', 'warning');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete all assignments for this event? This action cannot be undone.`
    );

    if (!confirmed) return;

    this.loading.set(true);
    this.dataLoaded.set(false);

    const affiliate_id = this.appConfig.affiliateId;
    const year = this.appConfig.year;
    const ordinal = this.selectedOrdinal()!;

    this.apiHeatAssignments
      .deleteUnlockedAssignmentsHeatAssignmentsDeleteUnlockedPost({
        body: { affiliate_id, year, ordinal },
      })
      .subscribe({
        next: (result) => {
          this.toastService.showToast(
            `Successfully deleted ${result.deleted_count} assignments from ${result.heats_found} heats`,
            'success'
          );
          this.loadHeats();
        },
        error: (error) => {
          console.error('Error deleting assignments:', error);
          this.toastService.showToast(
            'Failed to delete assignments: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  loadAthletePrefs() {
    const affiliateId = this.appConfig.affiliateId;
    const year = this.appConfig.year;

    this.apiAthletePrefs
      .getAllAthletePrefsAthletePrefsAllGet({
        year,
        affiliate_id: affiliateId,
      })
      .subscribe({
        next: (prefs) => {
          this.athletePrefs.set(prefs);
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading athlete preferences:', error);
          this.toastService.showToast(
            'Failed to load athlete preferences: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
          this.loading.set(false);
          this.dataLoaded.set(true);
        },
      });
  }

  getAssignmentsForHeat(heat: apiHeatsModel): apiHeatAssignmentModel[] {
    const heatId = heat.id;
    const search = this.searchTerm().toLowerCase().trim();
    const assignments = this.heatAssignments().filter(
      (a) => a.heat_id === heatId
    );

    // If searching, only return matching assignments
    if (search) {
      return assignments.filter((assignment) => {
        const athleteMatch = assignment.athlete_name
          ?.toLowerCase()
          .includes(search);
        const judgeMatch = assignment.judge_name
          ?.toLowerCase()
          .includes(search);
        return athleteMatch || judgeMatch;
      });
    }

    return assignments;
  }

  getAssignmentsForHeatShortName(shortName: string): apiHeatAssignmentModel[] {
    const heatsForShortName = this.heats().filter(
      (h) => h.short_name === shortName
    );
    const heatIds = new Set(heatsForShortName.map((h) => h.id));
    return this.heatAssignments().filter((a) => heatIds.has(a.heat_id));
  }

  getConflictingCrossfitIds(heat: apiHeatsModel): Set<number> {
    const assignments = this.getAssignmentsForHeat(heat);
    const athleteIds = new Set<number>();
    const judgeIds = new Set<number>();
    const conflicts = new Set<number>();

    assignments.forEach((a) => {
      if (a.athlete_crossfit_id) athleteIds.add(a.athlete_crossfit_id);
      if (a.judge_crossfit_id) judgeIds.add(a.judge_crossfit_id);
    });

    athleteIds.forEach((id) => {
      if (judgeIds.has(id)) conflicts.add(id);
    });

    return conflicts;
  }

  isHeatEditable(heat: apiHeatsModel): boolean {
    const firstAssignment = this.getAssignmentsForHeat(heat)[0];
    if (!firstAssignment) return true;
    return !firstAssignment.is_locked;
  }

  private getAvailableAthletes(excludeAssignmentId?: string) {
    const currentHeatIds = new Set(this.heats().map((h) => h.id));
    const assignedAthleteIds = new Set(
      this.heatAssignments()
        .filter(
          (a) =>
            a.id !== excludeAssignmentId &&
            currentHeatIds.has(a.heat_id) &&
            a.athlete_crossfit_id !== null
        )
        .map((a) => a.athlete_crossfit_id)
    );

    return computed(() => {
      const athletes = this.athleteDataService
        .athleteData()
        .filter((a) => !assignedAthleteIds.has(a.crossfit_id))
        .map((a) => a.name);

      return ['None', 'Add Non-Gym Athlete', ...athletes];
    });
  }

  private async handleNonGymAthleteInput(
    assignmentId: string,
    heatId: string
  ): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Add Non-Gym Athlete',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Athlete Name',
        },
        {
          name: 'crossfit_id',
          type: 'number',
          placeholder: 'CrossFit ID',
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
            if (!data.name || !data.crossfit_id) {
              this.toastService.showToast('Please fill all fields', 'warning');
              return false;
            }

            this.assignAthleteToHeat(
              assignmentId,
              heatId,
              parseInt(data.crossfit_id),
              data.name
            );

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  private assignAthleteToHeat(
    assignmentId: string | null,
    heatId: string,
    crossfitId: number,
    athleteName: string
  ): void {
    if (assignmentId) {
      // Update existing assignment
      this.apiHeatAssignments
        .updateExistingHeatAssignmentHeatAssignmentsAssignmentIdPatch$Response({
          assignment_id: assignmentId,
          body: {
            athlete_crossfit_id: crossfitId,
            athlete_name: athleteName,
          },
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              `${athleteName} assigned to heat`,
              'success'
            );
            this.loadHeatAssignments();
          },
          error: (error) => {
            console.error('Error updating assignment:', error);
            this.toastService.showToast(
              'Error assigning athlete: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger'
            );
          },
        });
    } else {
      // Create new assignment
      this.apiHeatAssignments
        .createNewHeatAssignmentHeatAssignmentsPost$Response({
          body: {
            heat_id: heatId,
            athlete_crossfit_id: crossfitId,
            athlete_name: athleteName,
          },
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              `${athleteName} added successfully`,
              'success'
            );
            this.loadHeatAssignments();
          },
          error: (error) => {
            console.error('Error adding athlete:', error);
            this.toastService.showToast(
              'Failed to add athlete: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger'
            );
          },
        });
    }
  }

  async addAthlete(heat: apiHeatsModel) {
    if (!this.isHeatEditable(heat)) {
      this.toastService.showToast('Cannot edit locked heat', 'warning');
      return;
    }

    const availableAthletes = this.getAvailableAthletes();
    const selectedName = await this.athleteNameModal.openAthleteSelectModal(
      availableAthletes
    );
    if (!selectedName) return;

    // Handle "None" selection - cancel
    if (selectedName === 'None') {
      return;
    }

    // Handle "Add Non-Gym Athlete" selection
    if (selectedName === 'Add Non-Gym Athlete') {
      await this.handleNonGymAthleteInput(null as any, heat.id);
      return;
    }

    const crossfitId = this.athleteDataService.getCrossfitId(selectedName);
    if (!crossfitId) {
      this.toastService.showToast('Athlete not found', 'danger');
      return;
    }

    this.assignAthleteToHeat(null, heat.id, crossfitId, selectedName);
  }

  removeAssignment(assignment: apiHeatAssignmentModel) {
    if (assignment.is_locked) {
      this.toastService.showToast('Cannot edit locked heat', 'warning');
      return;
    }

    this.apiHeatAssignments
      .deleteExistingHeatAssignmentHeatAssignmentsAssignmentIdDelete$Response({
        assignment_id: assignment.id,
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Assignment removed', 'success');
          this.loadHeatAssignments();
        },
        error: (error) => {
          console.error('Error removing assignment:', error);
          this.toastService.showToast(
            'Failed to remove assignment: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
        },
      });
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.loadHeats();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getEventName(ordinal: number): string {
    return (
      this.eventService.getWeekendEventName(ordinal, this.appConfig.year) ??
      'Unknown Event'
    );
  }

  getAthletePreferences(crossfitId: number | null): string {
    if (!crossfitId) return '';

    const prefs = this.athletePrefs()
      .filter((p) => p.crossfit_id === crossfitId)
      .sort((a, b) => a.preference_nbr - b.preference_nbr)
      .map((p) => p.preference);

    return prefs.length > 0 ? prefs.join(', ') : 'No preferences';
  }

  setHoveredJudge(judgeName: string | null) {
    this.hoveredJudgeName.set(judgeName);
  }

  async updateAthlete(assignment: apiHeatAssignmentModel, heat: apiHeatsModel) {
    if (!this.isHeatEditable(heat)) {
      this.toastService.showToast('Cannot edit locked heat', 'warning');
      return;
    }

    const availableAthletes = this.getAvailableAthletes(assignment.id);
    const selectedName = await this.athleteNameModal.openAthleteSelectModal(
      availableAthletes
    );
    if (!selectedName) return;

    // Handle "None" selection - remove athlete
    if (selectedName === 'None') {
      this.apiHeatAssignments
        .clearAthleteHeatAssignmentsAssignmentIdClearAthletePatch$Response({
          assignment_id: assignment.id,
        })
        .subscribe({
          next: () => {
            this.toastService.showToast('Athlete removed', 'success');
            this.loadHeatAssignments();
          },
          error: (error) => {
            console.error('Error removing athlete:', error);
            this.toastService.showToast(
              'Failed to remove athlete: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger'
            );
          },
        });
      return;
    }

    // Handle "Add Non-Gym Athlete" selection
    if (selectedName === 'Add Non-Gym Athlete') {
      await this.handleNonGymAthleteInput(assignment.id, heat.id);
      return;
    }

    const crossfitId = this.athleteDataService.getCrossfitId(selectedName);
    if (!crossfitId) {
      this.toastService.showToast('Athlete not found', 'danger');
      return;
    }

    this.assignAthleteToHeat(assignment.id, heat.id, crossfitId, selectedName);
  }

  async updateJudge(assignment: apiHeatAssignmentModel, heat: apiHeatsModel) {
    if (!this.isHeatEditable(heat)) {
      this.toastService.showToast('Cannot edit locked heat', 'warning');
      return;
    }

    const assignedJudgeIds = new Set(
      this.getAssignmentsForHeat(heat)
        .filter((a) => a.id !== assignment.id && a.judge_crossfit_id)
        .map((a) => a.judge_crossfit_id)
        .filter((id): id is number => id !== null)
    );

    const availableJudges = computed(() => [
      'None',
      ...this.athleteDataService
        .athleteData()
        .filter((a) => a.judge && !assignedJudgeIds.has(a.crossfit_id))
        .map((a) => a.name),
    ]);

    const selectedName = await this.athleteNameModal.openAthleteSelectModal(
      availableJudges
    );
    if (!selectedName) return;

    // Handle "None" selection - remove judge
    if (selectedName === 'None') {
      this.apiHeatAssignments
        .clearJudgeHeatAssignmentsAssignmentIdClearJudgePatch$Response({
          assignment_id: assignment.id,
        })
        .subscribe({
          next: () => {
            this.toastService.showToast('Judge removed', 'success');
            this.loadHeatAssignments();
          },
          error: (error) => {
            console.error('Error removing judge:', error);
            this.toastService.showToast(
              'Failed to remove judge: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger'
            );
          },
        });
      return;
    }

    const crossfitId = this.athleteDataService.getCrossfitId(selectedName);
    if (!crossfitId) {
      this.toastService.showToast('Judge not found', 'danger');
      return;
    }

    this.apiHeatAssignments
      .updateExistingHeatAssignmentHeatAssignmentsAssignmentIdPatch$Response({
        assignment_id: assignment.id,
        body: {
          judge_crossfit_id: crossfitId,
          judge_name: selectedName,
        },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast('Judge updated successfully', 'success');
          this.loadHeatAssignments();
        },
        error: (error) => {
          console.error('Error updating judge:', error);
          this.toastService.showToast(
            'Failed to update judge: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
        },
      });
  }

  async showJudgeSummary(shortName: string) {
    const assignments = this.getAssignmentsForHeatShortName(shortName);
    const judgeCounts = new Map<string, number>();

    assignments.forEach((assignment) => {
      if (assignment.judge_name) {
        judgeCounts.set(
          assignment.judge_name,
          (judgeCounts.get(assignment.judge_name) || 0) + 1
        );
      }
    });

    const judgeSummary = Array.from(judgeCounts.entries())
      .map(([judgeName, count]) => ({ judgeName, count }))
      .sort((a, b) => b.count - a.count);

    const modal = await this.modalController.create({
      component: JudgeSummaryModalComponent,
      componentProps: {
        shortName: shortName,
        judgeSummary: judgeSummary,
        allJudgeNames: this.judgeNames(),
      },
    });

    await modal.present();
  }

  async showOverallJudgeSummary() {
    const allAssignments = this.heatAssignments().filter((a) => {
      const heatIds = new Set(this.heats().map((h) => h.id));
      return heatIds.has(a.heat_id);
    });

    const judgeCounts = new Map<string, number>();
    allAssignments.forEach((assignment) => {
      const judgeName = assignment.judge_name || 'Unassigned';
      judgeCounts.set(judgeName, (judgeCounts.get(judgeName) || 0) + 1);
    });

    const judgeSummary = Array.from(judgeCounts.entries())
      .map(([judgeName, count]) => ({ judgeName, count }))
      .sort((a, b) => b.count - a.count);

    const modal = await this.modalController.create({
      component: JudgeSummaryModalComponent,
      componentProps: {
        shortName: 'All Heats',
        judgeSummary: judgeSummary,
        allJudgeNames: this.judgeNames(),
      },
    });

    await modal.present();
  }

  async showUnassignedAthletes() {
    const modal = await this.modalController.create({
      component: UnassignedAthletesModalComponent,
      componentProps: {
        unassignedAthletes: this.unassignedAthletes,
      },
    });

    await modal.present();
  }

  async showAllAthletePrefs() {
    // Group athlete preferences by heat short name (1st preference only)
    const prefsByHeat = new Map<string, number>();
    const allPrefs: Array<{
      athleteName: string;
      preferences: string[];
      firstPreference: string;
    }> = [];

    this.athletePrefs().forEach((pref) => {
      const athlete = this.athleteDataService
        .athleteData()
        .find((a) => a.crossfit_id === pref.crossfit_id);
      if (!athlete) return;

      // Get all preferences for this athlete
      const athletePrefs = this.athletePrefs()
        .filter((p) => p.crossfit_id === pref.crossfit_id)
        .sort((a, b) => a.preference_nbr - b.preference_nbr);

      // Only process each athlete once
      if (athletePrefs[0].preference_nbr === pref.preference_nbr) {
        const firstPref = athletePrefs[0].preference;
        const count = prefsByHeat.get(firstPref) || 0;
        prefsByHeat.set(firstPref, count + 1);

        allPrefs.push({
          athleteName: athlete.name,
          preferences: athletePrefs.map((p) => p.preference),
          firstPreference: firstPref,
        });
      }
    });

    // Sort summary by count descending
    const summary = Array.from(prefsByHeat.entries())
      .map(([heat, count]) => ({ heat, count }))
      .sort((a, b) => b.count - a.count);

    // Sort athletes by first preference
    allPrefs.sort((a, b) => a.firstPreference.localeCompare(b.firstPreference));

    const modal = await this.modalController.create({
      component: AthletePrefsModalComponent,
      componentProps: {
        athletePrefs: signal(allPrefs),
        summary: signal(summary),
      },
    });

    await modal.present();
  }

  async showAllJudgeAvailability() {
    const modal = await this.modalController.create({
      component: JudgeAvailabilityModalComponent,
    });

    await modal.present();
  }

  toggleLocked(heat: apiHeatsModel) {
    const firstAssignment = this.getAssignmentsForHeat(heat)[0];
    if (!firstAssignment) return;

    const newValue = !firstAssignment.is_locked;
    this.apiHeats
      .toggleLockedHeatsToggleLockedPost({
        body: {
          heat_id: heat.id,
          locked: newValue,
        },
      })
      .subscribe({
        next: (response) => {
          this.toastService.showToast(
            `${response.updated_count} assignments ${
              newValue ? 'locked' : 'unlocked'
            }`,
            'success'
          );
          this.loadHeatAssignments();
        },
        error: (error) => {
          console.error('Error updating is_locked:', error);
          this.toastService.showToast(
            'Failed to update lock status: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
        },
      });
  }

  toggleAllLocked() {
    const heatsWithAssignments = this.heatsWithAssignments();
    if (heatsWithAssignments.length === 0) {
      this.toastService.showToast('No heats to lock', 'warning');
      return;
    }

    const newValue = !this.allHeatsLocked();
    const toggleCalls = heatsWithAssignments.map((heat) =>
      this.apiHeats.toggleLockedHeatsToggleLockedPost({
        body: {
          heat_id: heat.id,
          locked: newValue,
        },
      })
    );

    forkJoin(toggleCalls).subscribe({
      next: () => {
        this.toastService.showToast(
          newValue ? 'All heats locked' : 'All heats unlocked',
          'success'
        );
        this.loadHeats();
      },
      error: (error) => {
        console.error('Error locking all heats:', error);
        this.toastService.showToast(
          'Failed to lock heats: ' +
            (error?.error?.detail ? error.error.detail : 'Unknown error'),
          'danger'
        );
      },
    });
  }

  togglePublished(heat: apiHeatsModel) {
    const firstAssignment = this.getAssignmentsForHeat(heat)[0];
    if (!firstAssignment) return;

    const newValue = !firstAssignment.is_published;
    this.apiHeats
      .togglePublishedHeatsTogglePublishedPost({
        body: {
          heat_id: heat.id,
          published: newValue,
        },
      })
      .subscribe({
        next: (response) => {
          this.toastService.showToast(
            `${response.updated_count} assignments ${
              newValue ? 'published' : 'unpublished'
            }`,
            'success'
          );
          this.loadHeatAssignments();
        },
        error: (error) => {
          console.error('Error updating is_published:', error);
          this.toastService.showToast(
            'Failed to update publish status: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger'
          );
        },
      });
  }

  toggleAllPublished() {
    const heatsWithAssignments = this.heatsWithAssignments();
    if (heatsWithAssignments.length === 0) {
      this.toastService.showToast('No heats to publish', 'warning');
      return;
    }

    const newValue = !this.allHeatsPublished();
    const toggleCalls = heatsWithAssignments.map((heat) =>
      this.apiHeats.togglePublishedHeatsTogglePublishedPost({
        body: {
          heat_id: heat.id,
          published: newValue,
        },
      })
    );

    forkJoin(toggleCalls).subscribe({
      next: () => {
        this.toastService.showToast(
          newValue ? 'All heats published' : 'All heats unpublished',
          'success'
        );
        this.loadHeats();
      },
      error: (error) => {
        console.error('Error publishing all heats:', error);
        this.toastService.showToast(
          'Failed to publish heats: ' +
            (error?.error?.detail ? error.error.detail : 'Unknown error'),
          'danger'
        );
      },
    });
  }

  toggleLockedForGroup(shortName: string) {
    const heatsInGroup = this.heats().filter((h) => h.short_name === shortName);
    if (heatsInGroup.length === 0) return;

    // Determine new lock state based on first heat's first assignment
    const firstAssignment = this.getAssignmentsForHeat(heatsInGroup[0])[0];
    if (!firstAssignment) {
      this.toastService.showToast('No assignments in this group', 'warning');
      return;
    }

    const newValue = !firstAssignment.is_locked;

    // Create array of API calls for each heat
    const toggleCalls = heatsInGroup.map((heat) =>
      this.apiHeats.toggleLockedHeatsToggleLockedPost({
        body: {
          heat_id: heat.id,
          locked: newValue,
        },
      })
    );

    // Execute all calls in parallel
    forkJoin(toggleCalls).subscribe({
      next: (responses) => {
        const totalUpdated = responses.reduce(
          (sum, r) => sum + r.updated_count,
          0
        );
        this.toastService.showToast(
          `${totalUpdated} assignments ${
            newValue ? 'locked' : 'unlocked'
          } across ${heatsInGroup.length} heats`,
          'success'
        );
        this.loadHeatAssignments();
      },
      error: (error) => {
        console.error('Error updating lock status for group:', error);
        this.toastService.showToast(
          'Failed to update lock status: ' +
            (error?.error?.detail ? error.error.detail : 'Unknown error'),
          'danger'
        );
      },
    });
  }

  togglePublishedForGroup(shortName: string) {
    const heatsInGroup = this.heats().filter((h) => h.short_name === shortName);
    if (heatsInGroup.length === 0) return;

    // Determine new publish state based on first heat's first assignment
    const firstAssignment = this.getAssignmentsForHeat(heatsInGroup[0])[0];
    if (!firstAssignment) {
      this.toastService.showToast('No assignments in this group', 'warning');
      return;
    }

    const newValue = !firstAssignment.is_published;

    // Create array of API calls for each heat
    const toggleCalls = heatsInGroup.map((heat) =>
      this.apiHeats.togglePublishedHeatsTogglePublishedPost({
        body: {
          heat_id: heat.id,
          published: newValue,
        },
      })
    );

    // Execute all calls in parallel
    forkJoin(toggleCalls).subscribe({
      next: (responses) => {
        const totalUpdated = responses.reduce(
          (sum, r) => sum + r.updated_count,
          0
        );
        this.toastService.showToast(
          `${totalUpdated} assignments ${
            newValue ? 'published' : 'unpublished'
          } across ${heatsInGroup.length} heats`,
          'success'
        );
        this.loadHeatAssignments();
      },
      error: (error) => {
        console.error('Error updating publish status for group:', error);
        this.toastService.showToast(
          'Failed to update publish status: ' +
            (error?.error?.detail ? error.error.detail : 'Unknown error'),
          'danger'
        );
      },
    });
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value || '');
  }

  async editHeat(heat: apiHeatsModel) {
    const firstAssignment = this.getAssignmentsForHeat(heat)[0];
    if (firstAssignment?.is_locked) {
      this.toastService.showToast('Cannot edit locked heat', 'warning');
      return;
    }

    // Convert UTC time to local time for datetime-local input
    const localDate = new Date(heat.start_time);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    const alert = await this.alertController.create({
      header: 'Edit Heat Time',
      inputs: [
        {
          name: 'startTime',
          type: 'datetime-local',
          value: localDateTime,
          label: 'Start Time',
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
            const newStartTime = data.startTime;

            this.apiHeats
              .updateExistingHeatHeatsYearAffiliateIdOrdinalStartTimePatch({
                year: heat.year,
                affiliate_id: heat.affiliate_id,
                ordinal: heat.ordinal,
                start_time: heat.start_time,
                body: {
                  start_time: newStartTime,
                  max_athletes: heat.max_athletes,
                },
              })
              .subscribe({
                next: () => {
                  this.toastService.showToast('Heat time updated', 'success');
                  this.loadHeats();
                },
                error: (error) => {
                  console.error('Error updating heat:', error);
                  this.toastService.showToast(
                    'Error updating heat: ' +
                      (error?.error?.detail
                        ? error.error.detail
                        : 'Unknown error'),
                    'danger'
                  );
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }
}
