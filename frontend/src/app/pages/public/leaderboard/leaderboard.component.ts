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
import {
  AGE_CATEGORIES,
  AgeCategory,
  Gender,
  GENDERS,
  ScoreService,
} from '../../../shared/score-filter/score.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { apiScoreModel } from '../../../api/models';
import { ordinalMap } from '../../../shared/ordinal-mapping';

@Component({
  selector: 'app-leaderboard',
  imports: [PagesComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  scoreService = inject(ScoreService);
  userAuth = inject(UserAuthService);

  showFilter = signal<boolean>(false);
  eventsList = Object.entries(ordinalMap);
  gendersList = GENDERS.filter((value) => value != 'All');
  ageCategoriesList = AGE_CATEGORIES.filter((value) => value != 'All');

  scoresRX = computed<apiScoreModel[]>(() =>
    this.scoreService
      .filteredRankScores()
      .filter((value: apiScoreModel) => value.affiliate_scaled === 'RX')
  );

  scoresScaled = computed<apiScoreModel[]>(() =>
    this.scoreService
      .filteredRankScores()
      .filter((value: apiScoreModel) => value.affiliate_scaled === 'Scaled')
  );

  constructor() {
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${this.scoreService.filteredEvent()} Leaderboard`
      );
    });
  }

  ngOnInit(): void {
    this.scoreService.getScores();
  }

  onChangeFilter(
    event: Event,
    type: 'event' | 'gender' | 'ageCategory' | 'top3'
  ) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      if (type === 'event') {
        this.scoreService.setFilter({ ordinal: Number(target.value) });
      } else if (type === 'gender') {
        this.scoreService.setFilter({ gender: target.value as Gender });
      } else if (type === 'ageCategory') {
        this.scoreService.setFilter({
          ageCategory: target.value as AgeCategory,
        });
      } else if (type === 'top3') {
        this.scoreService.setFilter({
          top3: target.value === '1',
        });
      }
    }
  }
}
