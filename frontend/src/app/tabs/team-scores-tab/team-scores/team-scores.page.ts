import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAccordion,
  IonAccordionGroup,
  IonCard,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/header/header.component';
import { EventService } from 'src/app/services/event.service';
import { apiScoreService } from 'src/app/api/services';
import { ScoreFilterService } from 'src/app/services/score-filter.service';
import { environment } from 'src/environments/environment';
import { apiIndividualScoreModel, apiTeamScoreModel } from 'src/app/api/models';
import { GetIndividualScoresScoreIndividualGet$Params } from 'src/app/api/fn/score/get-individual-scores-score-individual-get';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { TeamNamePipe } from '../../../pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { GetTeamScoresScoreTeamGet$Params } from 'src/app/api/fn/score/get-team-scores-score-team-get';

@Component({
  selector: 'app-team-scores',
  templateUrl: './team-scores.page.html',
  styleUrls: ['./team-scores.page.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonItem,
    IonList,
    IonLabel,
    IonSegmentButton,
    IonSegment,
    IonContent,
    IonAccordion,
    IonAccordionGroup,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
    TeamNamePipe,
  ],
})
export class TeamScoresPage implements OnInit {
  private eventService = inject(EventService);
  private apiScore = inject(apiScoreService);
  private helperFunctions = inject(HelperFunctionsService);
  scoreFilter = inject(ScoreFilterService);
  authService = inject(AuthService);

  @Input({ required: true }) year: number = 0;
  @Input({ required: true }) ordinal: number = 0;

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

  constructor() {}

  ngOnInit() {
    const params: GetTeamScoresScoreTeamGet$Params = {
      affiliate_id: environment.affiliateId,
      year: this.year,
      ordinal: this.ordinal > 0 ? this.ordinal : null,
    };
    this.apiScore.getTeamScoresScoreTeamGet(params).subscribe({
      next: (value: apiTeamScoreModel[]) => {
        this.teamScores.set(value);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
