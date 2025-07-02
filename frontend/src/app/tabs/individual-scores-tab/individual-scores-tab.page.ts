import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/header/header.component';
import { EventListComponent } from '../../shared/event-list/event-list.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-individual-scores-tab',
  templateUrl: './individual-scores-tab.page.html',
  styleUrls: ['./individual-scores-tab.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventListComponent,
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
