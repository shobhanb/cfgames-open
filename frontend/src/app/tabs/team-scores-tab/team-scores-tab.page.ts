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
import { ThemeComponent } from '../../shared/theme/theme.component';

@Component({
  selector: 'app-team-scores-tab',
  templateUrl: './team-scores-tab.page.html',
  styleUrls: ['./team-scores-tab.page.scss'],
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
    ThemeComponent,
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
