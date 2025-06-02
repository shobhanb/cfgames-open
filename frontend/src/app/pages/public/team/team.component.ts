import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { ScoreService } from '../../../shared/score-filter/score.service';

@Component({
  selector: 'app-team',
  imports: [PagesComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent implements OnInit {
  titleService = inject(TitleService);
  private dockService = inject(DockService);
  scoreService = inject(ScoreService);

  constructor() {
    this.titleService.pageTitle.set('Team');
    this.dockService.setPublic();
  }

  ngOnInit(): void {
    this.scoreService.getTeamScores();
  }
}
