import { Component, inject, signal } from '@angular/core';
import { ScoreFilterService } from './score-filter.service';
import {
  AGE_CATEGORIES,
  AgeCategory,
  Gender,
  GENDERS,
  ScoreFilter,
} from './score-filter';

@Component({
  selector: 'app-score-filter',
  imports: [],
  templateUrl: './score-filter.component.html',
  styleUrl: './score-filter.component.css',
})
export class ScoreFilterComponent {
  scoreFilter = inject(ScoreFilterService);

  onChangeEvent(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.scoreFilter.filter.update((value: ScoreFilter) => ({
      ...value,
      ordinal: Number(target.value),
    }));
  }

  onChangeGender(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.scoreFilter.filter.update((value: ScoreFilter) => ({
        ...value,
        gender: target.value as Gender,
      }));
    }
  }

  onChangeAgeCategory(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.scoreFilter.filter.update((value: ScoreFilter) => ({
        ...value,
        ageCategory: target.value as AgeCategory,
      }));
    }
  }

  onChangeTop3(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.scoreFilter.filter.update((value: ScoreFilter) => ({
      ...value,
      top3: target.value === '1',
    }));
  }
}
