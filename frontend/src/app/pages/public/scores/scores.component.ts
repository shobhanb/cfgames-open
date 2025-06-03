import { Component, effect, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { ScoreService } from '../../../shared/score-filter/score.service';
import { ScoreFilterComponent } from '../../../shared/score-filter/score-filter.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroHeart,
  heroHandRaised,
  heroScale,
} from '@ng-icons/heroicons/outline';
import { ionMedalOutline, ionBarbellOutline } from '@ng-icons/ionicons';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ScoreFilterService } from '../../../shared/score-filter/score-filter.service';

@Component({
  selector: 'app-scores',
  imports: [NgIcon, PagesComponent, ScoreFilterComponent],
  viewProviders: [
    provideIcons({
      heroHeart,
      heroScale,
      heroHandRaised,
      ionMedalOutline,
      ionBarbellOutline,
    }),
  ],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.css',
})
export class ScoresComponent implements OnInit {
  titleService = inject(TitleService);
  scoreService = inject(ScoreService);
  userAuth = inject(UserAuthService);
  scoreFilter = inject(ScoreFilterService);
  private dockService = inject(DockService);

  constructor() {
    this.dockService.setPublic();
    effect(() =>
      this.titleService.pageTitle.set(`${this.scoreService.event()} Scores`)
    );
  }

  ngOnInit(): void {
    this.scoreService.getScores();
  }
}
