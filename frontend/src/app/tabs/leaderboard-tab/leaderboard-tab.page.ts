import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/header/header.component';
import { EventListComponent } from '../../shared/event-list/event-list.component';

@Component({
  selector: 'app-leaderboard-tab',
  templateUrl: './leaderboard-tab.page.html',
  styleUrls: ['./leaderboard-tab.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventListComponent,
  ],
})
export class LeaderboardTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
