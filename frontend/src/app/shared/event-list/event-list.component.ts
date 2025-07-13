import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonList,
  IonLabel,
  IonItem,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  imports: [IonList, IonLabel, IonItem, RouterLink, IonRouterLink],
})
export class EventListComponent implements OnInit {
  eventService = inject(EventService);

  link = input.required<string>();
  showTotals = input<boolean>(false);

  constructor() {}

  ngOnInit() {}
}
