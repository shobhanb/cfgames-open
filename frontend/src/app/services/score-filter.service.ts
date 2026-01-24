import { effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export const GENDERS = ['M', 'F'] as const;
export const AGE_CATEGORIES = [
  'U18',
  'Open',
  'Masters',
  'Masters 55+',
] as const;
export type Gender = (typeof GENDERS)[number];
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

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
