import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroHeart,
  heroHandRaised,
  heroScale,
} from '@ng-icons/heroicons/outline';
import { ionMedalOutline, ionBarbellOutline } from '@ng-icons/ionicons';

@Component({
  selector: 'app-score-legend',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      heroHeart,
      heroScale,
      heroHandRaised,
      ionMedalOutline,
      ionBarbellOutline,
    }),
  ],
  templateUrl: './score-legend.component.html',
  styleUrl: './score-legend.component.css',
})
export class ScoreLegendComponent {}
