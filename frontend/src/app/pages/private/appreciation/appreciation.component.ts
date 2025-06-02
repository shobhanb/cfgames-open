import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-appreciation',
  imports: [PagesComponent],
  templateUrl: './appreciation.component.html',
  styleUrl: './appreciation.component.css',
})
export class AppreciationComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Appreciation');
    this.dockService.setPrivate();
  }
}
