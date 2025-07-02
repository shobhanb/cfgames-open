import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonTabs,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { trophy, barbell, people, person, lockOpen } from 'ionicons/icons';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabBar,
    IonIcon,
    IonTabs,
    IonTabButton,
    IonLabel,
    CommonModule,
    FormsModule,
    ToastComponent,
  ],
})
export class TabsPage implements OnInit {
  constructor() {
    addIcons({ trophy, barbell, people, person, lockOpen });
  }

  ngOnInit() {}
}
