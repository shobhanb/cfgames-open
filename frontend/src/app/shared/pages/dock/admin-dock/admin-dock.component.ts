import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeftCircle,
  heroCalendarDays,
  heroHeart,
  heroUserGroup,
  heroUsers,
  heroChartBar,
  heroClipboardDocumentCheck,
} from '@ng-icons/heroicons/outline';
import { DockService } from '../dock.service';

@Component({
  selector: 'app-admin-dock',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  viewProviders: [
    provideIcons({
      heroUsers,
      heroArrowLeftCircle,
      heroClipboardDocumentCheck,
      heroUserGroup,
      heroCalendarDays,
      heroHeart,
      heroChartBar,
    }),
  ],
  templateUrl: './admin-dock.component.html',
  styleUrl: './admin-dock.component.css',
})
export class AdminDockComponent {
  dockService = inject(DockService);

  onClickBack() {
    this.dockService.showDock.set('public');
  }
}
