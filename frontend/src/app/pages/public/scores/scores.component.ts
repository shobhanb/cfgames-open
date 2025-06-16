import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroHeart,
  heroHandRaised,
  heroScale,
} from '@ng-icons/heroicons/outline';
import { ionMedalOutline, ionBarbellOutline } from '@ng-icons/ionicons';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ScoreLegendComponent } from '../../../shared/score-legend/score-legend.component';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';
import { environment } from '../../../../environments/environment';
import {
  AGE_CATEGORIES,
  AgeCategory,
  Gender,
  GENDERS,
  ScoreFilterService,
} from '../../../shared/score-filter.service';
import { apiScoreService } from '../../../api/services';
import { apiIndividualScoreModel } from '../../../api/models';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { EventService } from '../../../shared/event.service';

@Component({
  selector: 'app-scores',
  imports: [NgIcon, PagesComponent, ScoreLegendComponent],
  viewProviders: [
    provideIcons({
      heroHeart,
      heroScale,
      heroHandRaised,
      ionMedalOutline,
      ionBarbellOutline,
    }),
  ],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.css',
})
export class ScoresComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private helperFunctions = inject(HelperFunctionsService);
  private apiScore = inject(apiScoreService);
  eventService = inject(EventService);
  scoreFilter = inject(ScoreFilterService);
  userAuth = inject(UserAuthService);

  showFilter = signal<boolean>(false);
  gendersList = GENDERS;
  ageCategoriesList = AGE_CATEGORIES;

  private _individualScores = signal<apiIndividualScoreModel[]>([]);

  readonly teams = computed<string[]>(() => [
    ...this._individualScores()
      .map((value: apiIndividualScoreModel) => value.team_name)
      .filter(this.helperFunctions.filterUnique)
      .sort(),
    'All',
  ]);

  readonly filteredIndividualScores = computed<apiIndividualScoreModel[]>(() =>
    this._individualScores().filter(
      (value: apiIndividualScoreModel) =>
        (this.scoreFilter.filter().ordinalTotals ||
          value.ordinal === this.scoreFilter.filter().ordinal) &&
        (this.scoreFilter.filter().allGenders ||
          value.gender === this.scoreFilter.filter().gender) &&
        (this.scoreFilter.filter().allAgeCategories ||
          value.age_category === this.scoreFilter.filter().ageCategory) &&
        (this.scoreFilter.filter().team === 'All' ||
          this.scoreFilter.filter().team === value.team_name)
    )
  );

  readonly aggregatedIndividualScores = computed<apiIndividualScoreModel[]>(
    () => {
      const scoreMap = new Map<number, apiIndividualScoreModel>();

      this.filteredIndividualScores().forEach(
        (score: apiIndividualScoreModel) => {
          const existingScore = scoreMap.get(score.competitor_id);

          if (!existingScore) {
            scoreMap.set(score.competitor_id, { ...score });
          } else {
            existingScore.appreciation_score += score.appreciation_score;
            existingScore.judge_score += score.judge_score;
            existingScore.attendance_score += score.attendance_score;
            existingScore.top3_score += score.top3_score;
            existingScore.participation_score += score.participation_score;
            existingScore.total_individual_score +=
              score.total_individual_score;
          }
        }
      );

      return Array.from(scoreMap.values()).sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
    }
  );

  scoreFilterDisplay = computed<string>(() => {
    const filter = this.scoreFilter.filter();

    let display = '';
    if (!filter.allGenders) {
      display += filter.gender;
    }
    if (!filter.allAgeCategories) {
      display += (display ? ' - ' : '') + filter.ageCategory;
    }
    if (filter.team !== 'All') {
      display += (display ? ' - ' : '') + filter.team;
    }

    return display === '' ? 'All' : display;
  });

  constructor() {
    this.eventService.initialize();
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${
          this.scoreFilter.filter().ordinalTotals
            ? 'Total'
            : this.scoreFilter.filteredEvent()
        } Scores`
      );
    });
  }

  ngOnInit(): void {
    this.apiScore
      .getIndividualScoresScoreIndividualGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiIndividualScoreModel[]>) => {
          this._individualScores.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  onChangeFilter(
    event: Event,
    type: 'event' | 'gender' | 'ageCategory' | 'team'
  ) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      if (type === 'event') {
        if (target.value === 'Total') {
          this.scoreFilter.setFilter({ ordinalTotals: true });
        } else {
          this.scoreFilter.setFilter({
            ordinalTotals: false,
            ordinal: Number(target.value),
          });
        }
      } else if (type === 'gender') {
        if (target.value === 'All') {
          this.scoreFilter.setFilter({ allGenders: true });
        } else {
          this.scoreFilter.setFilter({
            allGenders: false,
            gender: target.value as Gender,
          });
        }
      } else if (type === 'ageCategory') {
        if (target.value === 'All') {
          this.scoreFilter.setFilter({ allAgeCategories: true });
        } else {
          this.scoreFilter.setFilter({
            allAgeCategories: false,
            ageCategory: target.value as AgeCategory,
          });
        }
      } else if (type === 'team') {
        this.scoreFilter.setFilter({
          team: target.value,
        });
      }
    }
  }
}
