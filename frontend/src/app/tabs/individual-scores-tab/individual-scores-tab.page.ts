import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { EventListComponent } from '../../shared/event-list/event-list.component';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-individual-scores-tab',
  templateUrl: './individual-scores-tab.page.html',
  styleUrls: ['./individual-scores-tab.page.scss'],
  standalone: true,
  imports: [
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
export class IndividualScoresTabPage implements OnInit {
  private eventService = inject(EventService);

  handleRefresh(event: CustomEvent) {
    this.eventService.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }
  constructor() {}

  ngOnInit() {}
}
