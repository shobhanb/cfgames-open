import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { UserAuthService } from './user-auth/user-auth.service';
import { environment } from '../../environments/environment';

export const GENDERS = ['M', 'F'] as const;
export const AGE_CATEGORIES = ['Open', 'Masters', 'Masters 55+'] as const;
export type Gender = (typeof GENDERS)[number];
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

// ordinalTotals to be used for summary level scores for Team and Individual. Not on the leaderboard page
// ordinal will only have numbers, like 1, 2, 3
export interface ScoreFilter {
  ordinal: number;
  gender: Gender;
  ageCategory: AgeCategory;
  ordinalTotals: boolean;
  allGenders: boolean;
  allAgeCategories: boolean;
  top3: boolean;
  team: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreFilterService {
  private userAuth = inject(UserAuthService);

  private _scoreFilter = signal<ScoreFilter>({
    ordinal: 1,
    gender: 'F',
    ageCategory: 'Masters',
    ordinalTotals: false,
    allGenders: false,
    allAgeCategories: false,
    top3: true,
    team: 'All',
  });

  readonly filter = this._scoreFilter.asReadonly();

  readonly filteredEvent = computed<string>(
    () => environment.ordinalMap[this._scoreFilter().ordinal]
  );

  setFilter(filter: {
    ordinal?: number;
    gender?: Gender;
    ageCategory?: AgeCategory;
    ordinalTotals?: boolean;
    allGenders?: boolean;
    allAgeCategories?: boolean;
    top3?: boolean;
    team?: string;
  }) {
    this._scoreFilter.update((value: ScoreFilter) => {
      return {
        ordinal: filter.ordinal || value.ordinal,
        gender: filter.gender || value.gender,
        ageCategory: filter.ageCategory || value.ageCategory,
        ordinalTotals:
          filter.ordinalTotals != undefined
            ? filter.ordinalTotals
            : value.ordinalTotals,
        allGenders:
          filter.allGenders != undefined ? filter.allGenders : value.allGenders,
        allAgeCategories:
          filter.allAgeCategories != undefined
            ? filter.allAgeCategories
            : value.allAgeCategories,
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
