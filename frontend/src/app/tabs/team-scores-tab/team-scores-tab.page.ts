import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/header/header.component';
import { EventListComponent } from '../../shared/event-list/event-list.component';

@Component({
  selector: 'app-team-scores-tab',
  templateUrl: './team-scores-tab.page.html',
  styleUrls: ['./team-scores-tab.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventListComponent,
  ],
})
export class TeamScoresTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
