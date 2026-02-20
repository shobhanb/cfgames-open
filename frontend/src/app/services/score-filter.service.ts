import { effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export const GENDERS = ['M', 'F'] as const;

export const AGE_CATEGORIES_PRE_2026 = [
  'U18',
  'Open',
  'Masters',
  'Masters 55+',
] as const;

export const AGE_CATEGORIES_2026_PLUS = [
  'U18',
  'Open',
  'Masters 35-45',
  'Masters 45-55',
  'Masters 55+',
] as const;

export const ALL_AGE_CATEGORIES = [
  ...new Set([...AGE_CATEGORIES_PRE_2026, ...AGE_CATEGORIES_2026_PLUS]),
] as const;

export type Gender = (typeof GENDERS)[number];
export type AgeCategory = (typeof ALL_AGE_CATEGORIES)[number];

export interface ScoreFilter {
  gender: Gender;
  ageCategory: AgeCategory;
  team: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreFilterService {
  private authService = inject(AuthService);

  private _scoreFilter = signal<ScoreFilter>({
    gender: 'F',
    ageCategory: 'Masters',
    team: 'All',
  });

  readonly filter = this._scoreFilter.asReadonly();

  setFilter(filter: {
    gender?: Gender;
    ageCategory?: AgeCategory;
    team?: string;
  }) {
    this._scoreFilter.update((value: ScoreFilter) => {
      return {
        gender: filter.gender || value.gender,
        ageCategory: filter.ageCategory || value.ageCategory,
        team: filter.team || value.team,
      };
    });
  }

  getAgeCategories(year: number): readonly AgeCategory[] {
    return year >= 2026 ? AGE_CATEGORIES_2026_PLUS : AGE_CATEGORIES_PRE_2026;
  }

  validateCategory(category: AgeCategory, year: number): AgeCategory {
    const validCategories = this.getAgeCategories(year);
    if ((validCategories as readonly string[]).includes(category)) {
      return category;
    }

    if (year >= 2026) {
      // Mapping old -> new
      if (category === 'Masters') {
        return 'Masters 35-45';
      }
    } else {
      // Mapping new -> old
      if (category === 'Masters 35-45' || category === 'Masters 45-55') {
        return 'Masters';
      }
    }

    // Default fallback
    return 'Open';
  }

  constructor() {
    // this.eventService.initialize(); // Add this line
    effect(() => {
      if (this.authService.athlete()) {
        this.setFilter({
          gender: this.authService.athlete()?.gender,
          ageCategory: this.authService.athlete()?.age_category,
          team: this.authService.athlete()?.team_name,
        });
      }
    });
  }
}
