import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-myscore',
  imports: [PagesComponent],
  templateUrl: './myscore.component.html',
  styleUrl: './myscore.component.css',
})
export class MyscoreComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('My Scores');
    this.dockService.setPrivate();
  }
}
