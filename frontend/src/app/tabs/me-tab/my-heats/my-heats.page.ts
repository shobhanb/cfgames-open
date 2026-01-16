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
  IonItem,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  apiHeatAssignmentsService,
  apiHeatsService,
} from 'src/app/api/services';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AuthService } from 'src/app/services/auth.service';
import { apiHeatAssignmentModel, apiHeatsModel } from 'src/app/api/models';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';

@Component({
  selector: 'app-my-heats',
  templateUrl: './my-heats.page.html',
  styleUrls: ['./my-heats.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonSpinner,
    IonCol,
    IonRow,
    IonGrid,
    IonIcon,
    IonSelect,
    IonSelectOption,
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
  ],
})
export class MyHeatsPage implements OnInit {
  private authService = inject(AuthService);
  private apiHeatAssignments = inject(apiHeatAssignmentsService);
  private apiHeats = inject(apiHeatsService);
  athleteDataService = inject(AthleteDataService);
  eventService = inject(EventService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);

  constructor() {
    addIcons({
      person,
    });
  }

  readonly isJudge = this.authService.athlete()?.judge ?? false;
  readonly selectedOrdinal = signal<number | null>(null);
  readonly athleteAssignment = signal<apiHeatAssignmentModel | null>(null);
  readonly judgeAssignments = signal<apiHeatAssignmentModel[]>([]);
  readonly dataLoaded = signal<boolean>(false);
  readonly heatsMap = signal<Map<string, apiHeatsModel>>(new Map());

  readonly selectedEventName = computed(() => {
    const ordinal = this.selectedOrdinal();
    if (!ordinal) return null;
    return this.eventService.getWeekendEventName(ordinal, this.config.year);
  });

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
    this.heatsMap.set(new Map());
    this.athleteAssignment.set(null);
    this.judgeAssignments.set([]);

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
            let athleteLoaded = false;
            let judgeLoaded = false;
            const markLoaded = () => {
              if (athleteLoaded && judgeLoaded) {
                this.dataLoaded.set(true);
              }
            };

            this.apiHeatAssignments
              .getMyHeatAssignmentsAthleteHeatAssignmentsMeAthleteGet({
                year: year,
                ordinal: ordinal,
              })
              .subscribe({
                next: (athlete) => {
                  this.athleteAssignment.set(athlete);
                  athleteLoaded = true;
                  markLoaded();
                },
                error: () => {
                  athleteLoaded = true;
                  markLoaded();
                },
              });

            this.apiHeatAssignments
              .getMyHeatAssignmentsJudgeHeatAssignmentsMeJudgeGet({
                year: year,
                ordinal: ordinal,
              })
              .subscribe({
                next: (judge) => {
                  this.judgeAssignments.set(
                    judge.sort(
                      (
                        a: apiHeatAssignmentModel,
                        b: apiHeatAssignmentModel
                      ) => {
                        const heatA = this.getHeatDetails(a.heat_id);
                        const heatB = this.getHeatDetails(b.heat_id);
                        if (heatA && heatB) {
                          return (heatA.start_time ?? '').localeCompare(
                            heatB.start_time ?? ''
                          );
                        }
                        return 0;
                      }
                    )
                  );
                  judgeLoaded = true;
                  markLoaded();
                },
                error: () => {
                  judgeLoaded = true;
                  markLoaded();
                },
              });
          } else {
            this.apiHeatAssignments
              .getMyHeatAssignmentsAthleteHeatAssignmentsMeAthleteGet({
                year: year,
                ordinal: ordinal,
              })
              .subscribe({
                next: (assignment) => {
                  this.athleteAssignment.set(assignment);
                  this.dataLoaded.set(true);
                },
                error: (error) => {
                  this.dataLoaded.set(true);
                },
              });
          }
        },
        error: (error) => {
          this.toastService.showToast(
            'Error loading heat details: ' + (error?.error?.detail ?? ''),
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
