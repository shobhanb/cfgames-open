import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { apiScoreService } from '../../api/services';
import { environment } from '../../../environments/environment';
import { StrictHttpResponse } from '../../api/strict-http-response';
import { apiScoreModel, apiTeamScoreModel } from '../../api/models';
import { HelperFunctionsService } from '../helper-functions.service';
import { UserAuthService } from '../user-auth/user-auth.service';
import { ordinalMap } from '../ordinal-mapping';

export const GENDERS = ['M', 'F', 'All'] as const;
export const AGE_CATEGORIES = [
  'Open',
  'Masters',
  'Masters 55+',
  'All',
] as const;
export type Gender = (typeof GENDERS)[number];
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export interface ScoreFilter {
  ordinal?: number;
  gender?: Gender;
  ageCategory?: AgeCategory;
  top3?: boolean;
  team?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private apiScores = inject(apiScoreService);
  private userAuth = inject(UserAuthService);

  private _scores = signal<apiScoreModel[]>([]);
  private _teamScores = signal<apiTeamScoreModel[]>([]);
  private _teamScoresTotal = signal<apiTeamScoreModel[]>([]);

  private _scoreFilter = signal<ScoreFilter>({
    ordinal: 1,
    gender: 'F',
    ageCategory: 'Masters',
    top3: false,
    team: 'All',
  });

  // Score filter access point
  readonly scoreFilter = this._scoreFilter.asReadonly();

  // Event name e.g. 25.2 etc.
  readonly filteredEvent = computed<string>(
    () => ordinalMap[this.scoreFilter().ordinal || 1]
  );

  // Filtered scores for Leaderboards
  // Filtered by Ordinal, Gender, Age category & Top3
  // Sorted by rank
  readonly filteredRankScores = computed<apiScoreModel[]>(() =>
    this._scores()
      .filter(
        (value: apiScoreModel) =>
          value.ordinal === this.scoreFilter().ordinal &&
          (this.scoreFilter().gender === 'All' ||
            value.gender === this.scoreFilter().gender) &&
          (this.scoreFilter().ageCategory === 'All' ||
            value.age_category === this.scoreFilter().ageCategory) &&
          (!this.scoreFilter().top3 ||
            (!!value.affiliate_rank && value.affiliate_rank <= 3))
      )
      .sort(
        (a: apiScoreModel, b: apiScoreModel) =>
          (a.affiliate_rank || 0) - (b.affiliate_rank || 0)
      )
  );

  // Filtered Individual scores for Scores pages
  // Filtered by Ordinal, Gender, Age category
  // Sorted by Name
  readonly filteredIndividualScores = computed<apiScoreModel[]>(() =>
    this._scores()
      .filter(
        (value: apiScoreModel) =>
          value.ordinal === this.scoreFilter().ordinal &&
          (this.scoreFilter().gender === 'All' ||
            value.gender === this.scoreFilter().gender) &&
          (this.scoreFilter().ageCategory === 'All' ||
            value.age_category === this.scoreFilter().ageCategory)
      )
      .sort((a: apiScoreModel, b: apiScoreModel) => (a.name > b.name ? 1 : -1))
  );

  // Filtered Team scores
  // Filtered by Ordinal
  // Sorted by Team score Descending
  readonly filteredTeamScores = computed<apiTeamScoreModel[]>(() =>
    this._teamScores()
      .filter(
        (value: apiTeamScoreModel) =>
          value.ordinal === this.scoreFilter().ordinal
      )
      .sort(
        (a: apiTeamScoreModel, b: apiTeamScoreModel) =>
          b.total_team_score - a.total_team_score
      )
  );

  readonly teamScoresTotal = computed<apiTeamScoreModel[]>(() =>
    this._teamScoresTotal().sort(
      (a: apiTeamScoreModel, b: apiTeamScoreModel) =>
        b.total_team_score - a.total_team_score
    )
  );

  getScores() {
    this.apiScores
      .getScoresScoreAffiliateIdYearGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiScoreModel[]>) => {
          this._scores.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  getTeamScores() {
    this.apiScores
      .getTeamScoresAllScoreTeamAllAffiliateIdYearGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiTeamScoreModel[]>) => {
          this._teamScores.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });

    this.apiScores
      .getTeamScoresTotalScoreTeamTotalAffiliateIdYearGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiTeamScoreModel[]>) => {
          this._teamScoresTotal.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  setFilter(filter: ScoreFilter) {
    this._scoreFilter.update((value: ScoreFilter) => {
      return {
        ordinal: filter.ordinal || value.ordinal,
        gender: filter.gender || value.gender,
        ageCategory: filter.ageCategory || value.ageCategory,
        top3: filter.top3 != undefined ? filter.top3 : value.top3,
        team: filter.team || value.team,
      };
    });
  }

  constructor() {
    effect(() => {
      if (this.userAuth.athlete()) {
        this.setFilter({
          gender: this.userAuth.athlete()?.gender,
          ageCategory: this.userAuth.athlete()?.age_category,
          team: this.userAuth.athlete()?.team_name,
        });
      }
    });
  }
}
