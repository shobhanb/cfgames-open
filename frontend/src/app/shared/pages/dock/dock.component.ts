import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChartBar,
  heroHome,
  heroTrophy,
  heroUserGroup,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-dock',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  viewProviders: [
    provideIcons({
      heroHome,
      heroTrophy,
      heroUserGroup,
      heroChartBar,
      heroCalendarDays,
    }),
  ],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
})
export class DockComponent {}
