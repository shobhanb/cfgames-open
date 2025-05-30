import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AGE_CATEGORIES, GENDERS, ScoreFilter } from './score-filter';
import { UserAuthService } from '../user-auth/user-auth.service';
import { ordinalMap } from '../ordinal-mapping';

@Injectable({
  providedIn: 'root',
})
export class ScoreFilterService {
  private userAuth = inject(UserAuthService);

  private defaultScoreFilter: ScoreFilter = {
    ordinal: 1,
    gender: 'F',
    ageCategory: 'Open',
    top3: true,
  };

  filter = signal<ScoreFilter>(this.defaultScoreFilter);
  filteredEvent = computed<string>(() => ordinalMap[this.filter().ordinal!]);

  eventsList = Object.entries(ordinalMap);
  gendersList = GENDERS;
  ageCategoriesList = AGE_CATEGORIES;

  setFilter(filter: ScoreFilter) {
    this.filter.update((value: ScoreFilter) => {
      return {
        ordinal: filter.ordinal || value.ordinal,
        gender: filter.gender || value.gender,
        ageCategory: filter.ageCategory || value.ageCategory,
        topN: filter.top3 || value.top3,
      };
    });
  }

  resetFilter() {
    this.filter.set(this.defaultScoreFilter);
  }

  constructor() {
    effect(() => {
      if (this.userAuth.athlete()) {
        this.setFilter({
          gender: this.userAuth.athlete()!.gender,
          ageCategory: this.userAuth.athlete()!.age_category,
        });
      } else {
        this.resetFilter();
      }
    });
  }
}
