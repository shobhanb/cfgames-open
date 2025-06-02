import { Component, inject, OnInit } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { TitleService } from '../../../shared/title.service';

@Component({
  selector: 'app-attendance',
  imports: [PagesComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  titleService = inject(TitleService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Attendance Admin');
    this.dockService.setAdmin();
  }
}
