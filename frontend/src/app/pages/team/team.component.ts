import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../shared/pages/pages.component';
import { TitleService } from '../../shared/title.service';

@Component({
  selector: 'app-team',
  imports: [PagesComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {

  titleService = inject(TitleService);

  constructor () {
    this.titleService.pageTitle.set('Team')
  }
}
