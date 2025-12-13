import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { EventListComponent } from '../../shared/event-list/event-list.component';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-leaderboard-tab',
  templateUrl: './leaderboard-tab.page.html',
  styleUrls: ['./leaderboard-tab.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    EventListComponent,
    ToolbarButtonsComponent,
  ],
})
export class LeaderboardTabPage implements OnInit {
  private eventService = inject(EventService);

  handleRefresh(event: CustomEvent) {
    this.eventService.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  constructor() {}

  ngOnInit() {}
}
