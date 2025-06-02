import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-admin-scheduling',
  imports: [PagesComponent],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css',
})
export class SchedulingComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Scheduling Admin');
    this.dockService.setAdmin();
  }
}
