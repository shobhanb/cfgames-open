import { Component, computed, inject, OnInit, signal } from '@angular/core';
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

  private _userScores = signal<apiUserScoreModel[]>([]);

  readonly userScores = computed<Map<number, apiUserScoreModel[]>>(() => {
    // First create a map of all scores by year
    const tempMap = new Map<number, apiUserScoreModel[]>();

    this._userScores().forEach((score: apiUserScoreModel) => {
      const existingYear = tempMap.get(score.year);
      if (!existingYear) {
        tempMap.set(score.year, [score]);
      } else {
        existingYear.push(score);
      }
    });

    // Create new map with sorted years
    const orderedMap = new Map<number, apiUserScoreModel[]>();
    Array.from(tempMap.keys())
      .sort((a, b) => b - a) // Sort years descending
      .forEach((year) => {
        orderedMap.set(year, tempMap.get(year)!);
      });

    return orderedMap;
  });

  constructor() {
    this.titleService.pageTitle.set('My Scores');
    this.dockService.setPrivate();
  }

  ngOnInit(): void {
    this.apiScore.getMyScoresScoreMeGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiUserScoreModel[]>) => {
        this._userScores.set(response.body);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
