import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { apiScoreService } from '../../../api/services';
import { environment } from '../../../../environments/environment';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiScoreModel } from '../../../api/models';
import { ScoreFilterComponent } from '../../../shared/score-filter/score-filter.component';
import { ScoreFilterService } from '../../../shared/score-filter/score-filter.service';

@Component({
  selector: 'app-leaderboard',
  imports: [PagesComponent, ScoreFilterComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  titleService = inject(TitleService);
  apiScores = inject(apiScoreService);
  scoreFilter = inject(ScoreFilterService);

  scores = signal<apiScoreModel[]>([]);

  filteredScores = computed<apiScoreModel[]>(() => {
    const { ordinal, gender, ageCategory, top3 } = this.scoreFilter.filter();
    return this.scores().filter(
      (value: apiScoreModel) =>
        value.ordinal === ordinal &&
        value.gender === gender &&
        value.age_category === ageCategory &&
        (!top3 || (value.affiliate_rank != null && value.affiliate_rank <= 3))
    );
  });

  filteredScoresRX = computed<apiScoreModel[]>(() =>
    this.filteredScores().filter(
      (value: apiScoreModel) => value.affiliate_scaled == 'RX'
    )
  );
  filteredScoresScaled = computed<apiScoreModel[]>(() =>
    this.filteredScores().filter(
      (value: apiScoreModel) => value.affiliate_scaled == 'Scaled'
    )
  );

  latestOrdinal = computed<number>(
    () =>
      Math.max(...this.scores().map((value: apiScoreModel) => value.ordinal)) ||
      1
  );

  onTest() {
    console.log(this.filteredScores());
  }

  constructor() {
    this.titleService.pageTitle.set('Leaderboard');
  }

  ngOnInit(): void {
    this.apiScores
      .getScoresScoreAffiliateIdYearGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiScoreModel[]>) => {
          this.scores.set(response.body);
          if (this.latestOrdinal()) {
            // this.scoreFilter.setFilter({ ordinal: this.latestOrdinal() });
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }
}
