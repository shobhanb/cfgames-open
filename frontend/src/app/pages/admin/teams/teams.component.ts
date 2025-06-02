import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-teams',
  imports: [PagesComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css',
})
export class TeamsComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Teams Admin');
    this.dockService.setAdmin();
  }
}
