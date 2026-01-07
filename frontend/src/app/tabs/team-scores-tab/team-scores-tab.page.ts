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
  IonCardSubtitle,
  IonRouterLink,
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { EventListComponent } from '../../shared/event-list/event-list.component';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';

@Component({
  selector: 'app-team-scores-tab',
  templateUrl: './team-scores-tab.page.html',
  styleUrls: ['./team-scores-tab.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonCardSubtitle,
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
    RouterLink,
    IonRouterLink,
    IonChip,
    IonIcon,
  ],
})
export class TeamScoresTabPage implements OnInit {
  private eventService = inject(EventService);
  config = inject(AppConfigService);

  constructor() {
    addIcons({ star });
  }

  handleRefresh(event: CustomEvent) {
    this.eventService.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {}
}
