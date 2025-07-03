import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { AuthStateComponent } from '../../shared/auth-state/auth-state.component';

@Component({
  selector: 'app-leaderboard-tab',
  templateUrl: './leaderboard-tab.page.html',
  styleUrls: ['./leaderboard-tab.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonTitle,
    IonHeader,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    CommonModule,
    FormsModule,
    EventListComponent,
    AuthStateComponent,
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
