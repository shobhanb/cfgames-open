import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../shared/pages/pages.component';
import { TitleService } from '../../shared/title.service';

@Component({
  selector: 'app-leaderboard',
  imports: [PagesComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  titleService = inject(TitleService);

  constructor () {
    this.titleService.pageTitle.set('Leaderboard')
  }

}
