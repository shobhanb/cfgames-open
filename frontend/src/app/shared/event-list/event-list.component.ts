import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonList,
  IonLabel,
  IonItem,
  IonRouterLink,
  IonCard,
  IonChip,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophy, barbellOutline, star } from 'ionicons/icons';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  imports: [
    IonList,
    IonLabel,
    IonItem,
    RouterLink,
    IonRouterLink,
    IonCard,
    IonChip,
    IonIcon,
  ],
})
export class EventListComponent implements OnInit {
  eventService = inject(EventService);
  config = inject(AppConfigService);

  link = input.required<string>();
  showTotals = input<boolean>(false);

  constructor() {
    addIcons({ trophy, barbellOutline, star });
  }

  ngOnInit() {}
}
