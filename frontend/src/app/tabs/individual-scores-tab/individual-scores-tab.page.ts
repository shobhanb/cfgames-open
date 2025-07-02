import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/header/header.component';
import { EventListComponent } from '../../shared/event-list/event-list.component';

@Component({
  selector: 'app-individual-scores-tab',
  templateUrl: './individual-scores-tab.page.html',
  styleUrls: ['./individual-scores-tab.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventListComponent,
  ],
})
export class IndividualScoresTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
