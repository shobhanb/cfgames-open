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
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { apiScoreService } from '../../../api/services';
import { environment } from '../../../../environments/environment';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiLeaderboardScoreModel } from '../../../api/models';
import {
  AGE_CATEGORIES,
  AgeCategory,
  Gender,
  GENDERS,
  ScoreFilterService,
} from '../../../shared/score-filter.service';
import { EventService } from '../../../shared/event.service';

@Component({
  selector: 'app-leaderboard',
  imports: [PagesComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private apiScore = inject(apiScoreService);
  scoreFilter = inject(ScoreFilterService);
  userAuth = inject(UserAuthService);
  eventService = inject(EventService);

  showFilter = signal<boolean>(false);

  gendersList = GENDERS;
  ageCategoriesList = AGE_CATEGORIES;

  private leaderboard = signal<apiLeaderboardScoreModel[]>([]);

  private filteredLeaderboard = computed<apiLeaderboardScoreModel[]>(() =>
    this.leaderboard().filter(
      (value: apiLeaderboardScoreModel) =>
        value.ordinal === this.scoreFilter.filter().ordinal &&
        value.gender === this.scoreFilter.filter().gender &&
        value.age_category === this.scoreFilter.filter().ageCategory &&
        (!this.scoreFilter.filter().top3 ||
          (!!value.affiliate_rank && value.affiliate_rank <= 3))
    )
  );

  scoresRX = computed<apiLeaderboardScoreModel[]>(() =>
    this.filteredLeaderboard().filter(
      (value: apiLeaderboardScoreModel) => value.affiliate_scaled === 'RX'
    )
  );

  scoresScaled = computed<apiLeaderboardScoreModel[]>(() =>
    this.filteredLeaderboard().filter(
      (value: apiLeaderboardScoreModel) => value.affiliate_scaled === 'Scaled'
    )
  );

  constructor() {
    this.eventService.initialize();
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${this.scoreFilter.filteredEvent()} Leaderboard`
      );
    });
  }

  ngOnInit(): void {
    this.apiScore
      .getLeaderboardScoresScoreLeaderboardGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiLeaderboardScoreModel[]>) => {
          this.leaderboard.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  onChangeFilter(
    event: Event,
    type: 'event' | 'gender' | 'ageCategory' | 'top3'
  ) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      if (type === 'event') {
        this.scoreFilter.setFilter({ ordinal: Number(target.value) });
      } else if (type === 'gender') {
        this.scoreFilter.setFilter({ gender: target.value as Gender });
      } else if (type === 'ageCategory') {
        this.scoreFilter.setFilter({
          ageCategory: target.value as AgeCategory,
        });
      } else if (type === 'top3') {
        this.scoreFilter.setFilter({
          top3: target.value === '1',
        });
      }
    }
  }
}
