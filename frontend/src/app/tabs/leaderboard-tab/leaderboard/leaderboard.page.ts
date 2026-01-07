import {
  Component,
  inject,
  Input,
  OnInit,
  effect,
  computed,
  signal,
  numberAttribute,
} from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonNote,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonCardContent,
  IonCardSubtitle,
  IonChip,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event.service';
import { ToastService } from 'src/app/services/toast.service';
import { apiLeaderboardScoreModel } from 'src/app/api/models';
import { apiScoreService } from 'src/app/api/services';
import { ScoreFilterService } from 'src/app/services/score-filter.service';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { addIcons } from 'ionicons';
import { openOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonButtons,
    IonBackButton,
    IonHeader,
    IonRefresherContent,
    IonRefresher,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonIcon,
    IonButton,
    IonToolbar,
    IonNote,
    IonText,
    IonSegmentButton,
    IonSegment,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    TeamNamePipe,
    ToolbarButtonsComponent,
    IonCardContent,
    IonCardSubtitle,
    IonChip,
  ],
})
export class LeaderboardPage implements OnInit {
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private apiScore = inject(apiScoreService);
  private config = inject(AppConfigService);
  scoreFilter = inject(ScoreFilterService);
  authService = inject(AuthService);

  dataLoaded = signal<boolean>(false);

  @Input({ required: true, transform: numberAttribute }) year!: number;
  @Input({ required: true, transform: numberAttribute }) ordinal!: number;

  selectedTop3 = signal<boolean>(true);

  private event = computed<string | undefined>(() =>
    this.eventService.eventMap().get(`${this.year}-${this.ordinal}`)
  );
  readonly title = computed<string>(() => `${this.event()} Leaderboard`);

  readonly movementStandardsLink = computed<string>(() => {
    return this.eventService.getEventCrossfitLink(this.event() || '25.1');
  });

  private leaderboard = signal<apiLeaderboardScoreModel[]>([]);
  private filteredLeaderboard = computed<apiLeaderboardScoreModel[]>(() =>
    this.leaderboard().filter(
      (value: apiLeaderboardScoreModel) =>
        value.gender === this.scoreFilter.filter().gender &&
        value.age_category === this.scoreFilter.filter().ageCategory &&
        (this.selectedTop3() ? value.affiliate_rank <= 3 : true)
    )
  );

  leaderboardRX = computed(() =>
    this.filteredLeaderboard()
      .filter(
        (value: apiLeaderboardScoreModel) => value.affiliate_scaled === 'RX'
      )
      .sort(
        (a: apiLeaderboardScoreModel, b: apiLeaderboardScoreModel) =>
          a.affiliate_rank - b.affiliate_rank
      )
  );

  leaderboardScaled = computed(() =>
    this.filteredLeaderboard()
      .filter(
        (value: apiLeaderboardScoreModel) => value.affiliate_scaled === 'Scaled'
      )
      .sort(
        (a: apiLeaderboardScoreModel, b: apiLeaderboardScoreModel) =>
          a.affiliate_rank - b.affiliate_rank
      )
  );

  private getData() {
    this.apiScore
      .getLeaderboardScoresScoreLeaderboardGet({
        affiliate_id: this.config.affiliateId,
        year: this.year,
        ordinal: this.ordinal,
      })
      .subscribe({
        next: (data: apiLeaderboardScoreModel[]) => {
          this.leaderboard.set(data);
          this.dataLoaded.set(true);
        },
        error: (err: any) => {
          console.error(err);
          this.toastService.showToast(
            'Error fetching leaderboard scores: ' + err.error?.detail,
            'danger',
            null,
            3000
          );
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  onSelectionChanged(
    event: CustomEvent,
    type: 'gender' | 'ageCategory' | 'top3'
  ) {
    if (type === 'gender') {
      this.scoreFilter.setFilter({ gender: event.detail.value });
    } else if (type === 'ageCategory') {
      this.scoreFilter.setFilter({ ageCategory: event.detail.value });
    } else if (type === 'top3') {
      this.selectedTop3.set(event.detail.value === 'Top3');
    }
  }

  constructor() {
    addIcons({ openOutline });
    effect(() => {
      if (this.eventService.eventsLoaded() && !this.event()) {
        this.toastService.show404();
      }
    });
  }

  ngOnInit() {
    this.getData();
  }
}
