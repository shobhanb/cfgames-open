import { Component, effect, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { ScoreFilterComponent } from '../../../shared/score-filter/score-filter.component';
import { ScoreService } from '../../../shared/score-filter/score.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ScoreFilterService } from '../../../shared/score-filter/score-filter.service';

@Component({
  selector: 'app-leaderboard',
  imports: [PagesComponent, ScoreFilterComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
})
export class LeaderboardComponent implements OnInit {
  titleService = inject(TitleService);
  scoreService = inject(ScoreService);
  scoreFilter = inject(ScoreFilterService);
  private dockService = inject(DockService);
  userAuth = inject(UserAuthService);

  constructor() {
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${this.scoreService.event()} Leaderboard`
      );
    });
  }

  ngOnInit(): void {
    this.scoreService.getScores();
  }
}
