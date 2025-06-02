import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-myteam',
  imports: [PagesComponent],
  templateUrl: './myteam.component.html',
  styleUrl: './myteam.component.css',
})
export class MyteamComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('My Team');
    this.dockService.setPrivate();
  }
}
