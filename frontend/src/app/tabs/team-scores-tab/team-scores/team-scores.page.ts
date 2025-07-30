import {
  Component,
  computed,
  inject,
  Input,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
import {
  IonContent,
  IonLabel,
  IonList,
  IonItem,
  IonAccordion,
  IonAccordionGroup,
  IonCard,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event.service';
import { apiScoreService } from 'src/app/api/services';
import { ScoreFilterService } from 'src/app/services/score-filter.service';
import { apiTeamScoreModel } from 'src/app/api/models';
import { TeamNamePipe } from '../../../pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { GetTeamScoresScoreTeamGet$Params } from 'src/app/api/fn/score/get-team-scores-score-team-get';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-team-scores',
  templateUrl: './team-scores.page.html',
  styleUrls: ['./team-scores.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonHeader,
    IonRefresherContent,
    IonRefresher,
    IonCard,
    IonItem,
    IonList,
    IonLabel,
    IonContent,
    IonAccordion,
    IonAccordionGroup,
    IonSkeletonText,
    TeamNamePipe,
    ToolbarButtonsComponent,
  ],
})
export class TeamScoresPage implements OnInit {
  private eventService = inject(EventService);
  private apiScore = inject(apiScoreService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);

  scoreFilter = inject(ScoreFilterService);
  authService = inject(AuthService);

  @Input({ required: true, transform: numberAttribute }) year!: number;
  @Input({ required: true, transform: numberAttribute }) ordinal!: number;

  private event = computed<string | undefined>(() => {
    if (this.ordinal == 0) {
      return `${this.year} Total`;
    } else {
      return this.eventService.eventMap().get(`${this.year}-${this.ordinal}`);
    }
  });
  readonly title = computed<string>(() => `${this.event()} Scores`);

  private teamScores = signal<apiTeamScoreModel[]>([]);

  readonly aggregatedScores = computed<apiTeamScoreModel[]>(() => {
    const scoreMap = new Map<string, apiTeamScoreModel>();

    this.teamScores().forEach((score: apiTeamScoreModel) => {
      const existingScore = scoreMap.get(score.team_name);

      if (!existingScore) {
        scoreMap.set(score.team_name, { ...score });
      } else {
        existingScore.participation_score += score.participation_score;
        existingScore.top3_score += score.top3_score;
        existingScore.judge_score += score.judge_score;
        existingScore.attendance_score += score.attendance_score;
        existingScore.appreciation_score += score.appreciation_score;
        existingScore.side_challenge_score += score.side_challenge_score;
        existingScore.spirit_score += score.spirit_score;
        existingScore.total_team_score += score.total_team_score;
      }
    });

    return Array.from(scoreMap.values()).sort(
      (a: apiTeamScoreModel, b: apiTeamScoreModel) => {
        if (a.total_team_score === b.total_team_score) {
          return a.team_name > b.team_name ? 1 : -1;
        } else {
          return b.total_team_score - a.total_team_score;
        }
      }
    );
  });

  readonly rankedScores = computed(() => {
    const scores = this.aggregatedScores();
    let lastScore: number | null = null;
    let lastRank = 0;
    let displayRank = 0;
    return scores.map((score: apiTeamScoreModel, idx: number) => {
      displayRank = score.total_team_score !== lastScore ? idx + 1 : lastRank;
      lastScore = score.total_team_score;
      lastRank = displayRank;
      return { ...score, rank: displayRank };
    });
  });

  expandedAccordions: string[] = [];
  dataLoaded = false;

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    this.expandedAccordions = [];
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    const params: GetTeamScoresScoreTeamGet$Params = {
      affiliate_id: this.config.affiliateId,
      year: this.year,
      ordinal: this.ordinal > 0 ? this.ordinal : null,
    };
    this.apiScore.getTeamScoresScoreTeamGet(params).subscribe({
      next: (value: apiTeamScoreModel[]) => {
        this.teamScores.set(value);
        this.dataLoaded = true;
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.showToast(err.message, 'danger', null, 3000);
      },
    });
  }

  constructor() {}

  ngOnInit() {
    this.getData();
  }
}
