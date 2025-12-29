import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonList,
  IonItem,
  IonSkeletonText,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import {
  apiHeatAssignmentsService,
  apiHeatsService,
} from 'src/app/api/services';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AuthService } from 'src/app/services/auth.service';
import {
  apiEventsModel,
  apiHeatAssignmentModel,
  apiHeatsModel,
} from 'src/app/api/models';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-heats',
  templateUrl: './my-heats.page.html',
  styleUrls: ['./my-heats.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonSkeletonText,
    IonSelect,
    IonSelectOption,
    IonList,
    IonLabel,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    DatePipe,
    FormsModule,
    ToolbarButtonsComponent,
    IonCardSubtitle,
  ],
})
export class MyHeatsPage implements OnInit {
  private authService = inject(AuthService);
  private apiHeatAssignments = inject(apiHeatAssignmentsService);
  private apiHeats = inject(apiHeatsService);
  eventService = inject(EventService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);

  readonly isJudge = this.authService.athlete()?.judge ?? false;
  readonly selectedOrdinal = signal<number | null>(null);
  readonly athleteAssignment = signal<apiHeatAssignmentModel | null>(null);
  readonly judgeAssignments = signal<apiHeatAssignmentModel[]>([]);
  readonly dataLoaded = signal<boolean>(false);
  readonly heatsMap = signal<Map<string, apiHeatsModel>>(new Map());

  readonly selectedEventName = computed(() => {
    const ordinal = this.selectedOrdinal();
    if (!ordinal) return null;
    return this.eventService.getEventName(ordinal, this.config.year);
  });

  ionViewWillEnter() {
    const events = this.eventService.currentYearEvents();
    if (events.length > 0) {
      this.selectedOrdinal.set(events[0].ordinal);
      this.loadAssignments(events[0].ordinal);
    }
  }

  ngOnInit() {}

  handleRefresh(event: CustomEvent) {
    const selectedOrdinal = this.selectedOrdinal();
    if (selectedOrdinal) {
      this.loadAssignments(selectedOrdinal);
    }
    (event.target as HTMLIonRefresherElement).complete();
  }

  onEventSelect() {
    if (this.selectedOrdinal()) {
      this.loadAssignments(this.selectedOrdinal()!);
    }
  }

  private loadAssignments(ordinal: number) {
    this.dataLoaded.set(false);

    const year = this.config.year;

    // Load heats first to get heat details
    this.apiHeats
      .getHeatsByFilterHeatsFilterYearAffiliateIdOrdinalGet({
        year: year,
        affiliate_id: this.config.affiliateId,
        ordinal: ordinal,
      })
      .subscribe({
        next: (heats: apiHeatsModel[]) => {
          const heatsMap = new Map<string, apiHeatsModel>();
          heats.forEach((heat: apiHeatsModel) => heatsMap.set(heat.id, heat));
          this.heatsMap.set(heatsMap);

          // Now load assignments
          if (this.isJudge) {
            forkJoin({
              athlete:
                this.apiHeatAssignments.getMyHeatAssignmentsAthleteHeatAssignmentsMeAthleteGet(
                  { ordinal }
                ),
              judge:
                this.apiHeatAssignments.getMyHeatAssignmentsJudgeHeatAssignmentsMeJudgeGet(
                  { ordinal }
                ),
            }).subscribe({
              next: ({ athlete, judge }) => {
                this.athleteAssignment.set(athlete);
                this.judgeAssignments.set(judge);
                this.dataLoaded.set(true);
              },
              error: () => {
                this.dataLoaded.set(true);
              },
            });
          } else {
            this.apiHeatAssignments
              .getMyHeatAssignmentsAthleteHeatAssignmentsMeAthleteGet({
                ordinal,
              })
              .subscribe({
                next: (assignment) => {
                  this.athleteAssignment.set(assignment);
                  this.dataLoaded.set(true);
                },
                error: () => {
                  this.dataLoaded.set(true);
                },
              });
          }
        },
        error: () => {
          this.toastService.showToast(
            'Error loading heat details',
            'danger',
            null,
            3000
          );
          this.dataLoaded.set(true);
        },
      });
  }

  getHeatDetails(heatId: string): apiHeatsModel | undefined {
    return this.heatsMap().get(heatId);
  }
}
