import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-scheduling',
  imports: [PagesComponent],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css',
})
export class SchedulingComponent {
  titleService = inject(TitleService);

  constructor() {
    this.titleService.pageTitle.set('Scheduling');
  }
}
