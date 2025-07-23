import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  codeOutline,
  bodyOutline,
  codeWorkingOutline,
  codeSlashOutline,
  clipboardOutline,
  golfOutline,
  calendarNumberOutline,
  heartOutline,
  heartCircleOutline,
  homeOutline,
} from 'ionicons/icons';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-admin-tab',
  templateUrl: './admin-tab.page.html',
  styleUrls: ['./admin-tab.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonLabel,
    IonItem,
    IonList,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonContent,
    ToolbarButtonsComponent,
    IonRouterLink,
    RouterLink,
  ],
})
export class AdminTabPage implements OnInit {
  constructor() {
    addIcons({
      codeOutline,
      codeWorkingOutline,
      codeSlashOutline,
      heartCircleOutline,
      heartOutline,
      clipboardOutline,
      golfOutline,
      calendarNumberOutline,
      bodyOutline,
      homeOutline,
    });
  }

  ngOnInit() {}
}
