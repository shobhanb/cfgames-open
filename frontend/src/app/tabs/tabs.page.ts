import { Component, inject, OnInit } from '@angular/core';
import {
  IonTabs,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterLink,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  trophy,
  barbell,
  people,
  person,
  lockOpen,
  home,
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

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
    RouterLink,
    IonRouterLink,
  ],
})
export class TabsPage implements OnInit {
  authService = inject(AuthService);

  constructor() {
    addIcons({ home, trophy, barbell, people, person, lockOpen });
  }

  ngOnInit() {}
}
