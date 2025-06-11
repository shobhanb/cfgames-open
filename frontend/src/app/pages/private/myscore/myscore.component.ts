import { Component, inject, OnInit, signal } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';
import { apiScoreService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiUserScoreModel } from '../../../api/models';

@Component({
  selector: 'app-myscore',
  imports: [PagesComponent],
  templateUrl: './myscore.component.html',
  styleUrl: './myscore.component.css',
})
export class MyscoreComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private apiScore = inject(apiScoreService);

  userScores = signal<apiUserScoreModel[]>([]);

  constructor() {
    this.titleService.pageTitle.set('My Scores');
    this.dockService.setPrivate();
  }

  ngOnInit(): void {
    this.apiScore.getMyScoresScoreMeGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiUserScoreModel[]>) => {
        this.userScores.set(response.body);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
