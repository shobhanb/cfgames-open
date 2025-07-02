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
import { apiIndividualScoreModel } from 'src/app/api/models';
import { GetIndividualScoresScoreIndividualGet$Params } from 'src/app/api/fn/score/get-individual-scores-score-individual-get';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { TeamNamePipe } from '../../../pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-individual-scores',
  templateUrl: './individual-scores.page.html',
  styleUrls: ['./individual-scores.page.scss'],
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
export class IndividualScoresPage implements OnInit {
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

  readonly teamsList = computed<string[]>(() =>
    this.scores()
      .map((value: apiIndividualScoreModel) => value.team_name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  onSelectionChanged(
    event: CustomEvent,
    type: 'gender' | 'ageCategory' | 'team'
  ) {
    if (type === 'gender') {
      this.scoreFilter.setFilter({ gender: event.detail.value });
    } else if (type === 'ageCategory') {
      this.scoreFilter.setFilter({ ageCategory: event.detail.value });
    } else if (type === 'team') {
      this.scoreFilter.setFilter({ team: event.detail.value });
    }
    this.expandedAccordions = [];
  }

  private scores = signal<apiIndividualScoreModel[]>([]);

  readonly filteredScores = computed<apiIndividualScoreModel[]>(() =>
    this.scores()
      .filter(
        (value: apiIndividualScoreModel) =>
          value.gender === this.scoreFilter.filter().gender &&
          value.age_category === this.scoreFilter.filter().ageCategory &&
          value.team_name === this.scoreFilter.filter().team
      )
      .sort((a: apiIndividualScoreModel, b: apiIndividualScoreModel) => {
        if (a.total_individual_score === b.total_individual_score) {
          return a.name > b.name ? 1 : -1;
        } else {
          return b.total_individual_score - a.total_individual_score;
        }
      })
  );

  readonly aggregatedScores = computed<apiIndividualScoreModel[]>(() => {
    const scoreMap = new Map<number, apiIndividualScoreModel>();

    this.filteredScores().forEach((score: apiIndividualScoreModel) => {
      const existingScore = scoreMap.get(score.crossfit_id);

      if (!existingScore) {
        scoreMap.set(score.crossfit_id, { ...score });
      } else {
        existingScore.participation_score += score.participation_score;
        existingScore.top3_score += score.top3_score;
        existingScore.judge_score += score.judge_score;
        existingScore.attendance_score += score.attendance_score;
        existingScore.appreciation_score += score.appreciation_score;
        existingScore.total_individual_score += score.total_individual_score;
      }
    });

    return Array.from(scoreMap.values()).sort(
      (a: apiIndividualScoreModel, b: apiIndividualScoreModel) => {
        if (a.total_individual_score === b.total_individual_score) {
          return a.name > b.name ? 1 : -1;
        } else {
          return b.total_individual_score - a.total_individual_score;
        }
      }
    );
  });

  expandedAccordions: string[] = [];

  constructor() {}

  ngOnInit() {
    const params: GetIndividualScoresScoreIndividualGet$Params = {
      affiliate_id: environment.affiliateId,
      year: this.year,
      ordinal: this.ordinal > 0 ? this.ordinal : null,
    };
    this.apiScore.getIndividualScoresScoreIndividualGet(params).subscribe({
      next: (value: apiIndividualScoreModel[]) => {
        this.scores.set(value);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
