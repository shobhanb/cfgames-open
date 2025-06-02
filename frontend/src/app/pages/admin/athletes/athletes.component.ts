import { Component, inject } from '@angular/core';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { PagesComponent } from '../../../shared/pages/pages.component';

@Component({
  selector: 'app-athletes',
  imports: [PagesComponent],
  templateUrl: './athletes.component.html',
  styleUrl: './athletes.component.css',
})
export class AthletesComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Athletes Admin');
    this.dockService.setAdmin();
  }
}
