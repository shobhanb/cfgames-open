import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';
import { apiScoreService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiUserScoreModel } from '../../../api/models';
import { EventService } from '../../../shared/event.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionOpenOutline } from '@ng-icons/ionicons';

@Component({
  selector: 'app-myscore',
  imports: [PagesComponent, NgIcon],
  providers: [provideIcons({ ionOpenOutline })],
  templateUrl: './myscore.component.html',
  styleUrl: './myscore.component.css',
})
export class MyscoreComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private apiScore = inject(apiScoreService);
  eventService = inject(EventService);

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

  getEventPath(score: apiUserScoreModel): string {
    const baseURL = 'https://games.crossfit.com/workouts/open';
    // Remove any non-numeric characters after the decimal

    const event = this.eventService.getEventName(score.ordinal, score.year);

    const [year, eventNum] = event.split('.');
    const fullYear = '20' + year;
    const cleanEventNum = eventNum.replace(/[a-zA-Z]/g, '');

    let returnURL = `${baseURL}/${fullYear}/${cleanEventNum}`;

    if (score.gender === 'M') {
      returnURL += '?division=1';
    } else {
      returnURL += '?division=2';
    }
    if (score.affiliate_scaled === 'Scaled') {
      returnURL += '&scaled=1';
    }

    return returnURL;
  }

  constructor() {
    this.titleService.pageTitle.set('My Scores');
    this.dockService.setPrivate();
    this.eventService.initialize();
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
