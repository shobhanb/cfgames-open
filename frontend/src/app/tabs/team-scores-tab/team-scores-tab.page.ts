import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { EventListComponent } from '../../shared/event-list/event-list.component';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-team-scores-tab',
  templateUrl: './team-scores-tab.page.html',
  styleUrls: ['./team-scores-tab.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle,
    IonCardHeader,
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
export class TeamScoresTabPage implements OnInit {
  private eventService = inject(EventService);

  handleRefresh(event: CustomEvent) {
    this.eventService.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }
  constructor() {}

  ngOnInit() {}
}
