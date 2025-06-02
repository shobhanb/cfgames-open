import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-sidescores',
  imports: [PagesComponent],
  templateUrl: './sidescores.component.html',
  styleUrl: './sidescores.component.css',
})
export class SidescoresComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Side Scores');
    this.dockService.setAdmin();
  }
}
