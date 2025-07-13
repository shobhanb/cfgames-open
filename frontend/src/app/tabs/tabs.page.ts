import { Component, inject, OnInit } from '@angular/core';
import {
  IonTabs,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonLabel,
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
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';

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
    ToastComponent,
  ],
})
export class TabsPage implements OnInit {
  authService = inject(AuthService);

  constructor() {
    addIcons({ home, trophy, barbell, people, person, lockOpen });
  }

  ngOnInit() {}
}
