import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-scores',
  imports: [PagesComponent],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.css',
})
export class ScoresComponent {
  titleService = inject(TitleService);

  constructor() {
    this.titleService.pageTitle.set('Scores');
  }
}
