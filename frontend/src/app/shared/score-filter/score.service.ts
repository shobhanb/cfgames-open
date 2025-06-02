import { computed, inject, Injectable, signal } from '@angular/core';
import { apiScoreService } from '../../api/services';
import { environment } from '../../../environments/environment';
import { StrictHttpResponse } from '../../api/strict-http-response';
import { apiScoreModel, apiTeamScoreModel } from '../../api/models';
import { ScoreFilterService } from './score-filter.service';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  apiScores = inject(apiScoreService);
  scoreFilter = inject(ScoreFilterService);

  scores = signal<apiScoreModel[]>([]);
  teamScores = signal<apiTeamScoreModel[]>([]);
  event = computed<string>(
    () => environment.ordinalMap[this.scoreFilter.filter().ordinal ?? 1]
  );

  // Main filtered scores
  // Does not filter for top 3 here
  filteredScores = computed<apiScoreModel[]>(() => {
    const { ordinal, gender, ageCategory, top3 } = this.scoreFilter.filter();
    return this.scores().filter(
      (value: apiScoreModel) =>
        value.ordinal === ordinal &&
        value.gender === gender &&
        value.age_category === ageCategory
    );
  });

  // Main RX Scores
  // This filters for Top 3
  filteredScoresRXTopN = computed<apiScoreModel[]>(() =>
    this.filteredScores().filter(
      (value: apiScoreModel) =>
        value.affiliate_scaled == 'RX' &&
        (!this.scoreFilter.filter().top3 ||
          (value.affiliate_rank != null && value.affiliate_rank <= 3))
    )
  );

  // Main Scaled Scores
  // This filters for Top 3
  filteredScoresScaledTopN = computed<apiScoreModel[]>(() =>
    this.filteredScores().filter(
      (value: apiScoreModel) =>
        value.affiliate_scaled == 'Scaled' &&
        (!this.scoreFilter.filter().top3 ||
          (value.affiliate_rank != null && value.affiliate_rank <= 3))
    )
  );

  // Scores sorted by individual score
  individualScores = computed<apiScoreModel[]>(() =>
    this.filteredScores().sort(
      (a: apiScoreModel, b: apiScoreModel) =>
        b.total_individual_score - a.total_individual_score
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
          this.scores.set(response.body);
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
          this.teamScores.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  constructor() {}
}
