import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeftCircle,
  heroCalendar,
  heroHeart,
  heroChartBar,
  heroUserGroup,
} from '@ng-icons/heroicons/outline';
import { DockService } from '../dock.service';

@Component({
  selector: 'app-private-dock',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  viewProviders: [
    provideIcons({
      heroArrowLeftCircle,
      heroCalendar,
      heroHeart,
      heroChartBar,
      heroUserGroup,
    }),
  ],
  templateUrl: './private-dock.component.html',
  styleUrl: './private-dock.component.css',
})
export class PrivateDockComponent {
  dockService = inject(DockService);

  onClickBack() {
    this.dockService.showDock.set('public');
  }
}
