import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';

@Component({
  selector: 'app-scheduling',
  imports: [PagesComponent],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css',
})
export class SchedulingComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Scheduling');
    this.dockService.setPrivate();
  }
}
