import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
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
  ],
})
export class AdminTabPage implements OnInit {
  constructor() {
    addIcons({
      bodyOutline,
      codeOutline,
      codeWorkingOutline,
      codeSlashOutline,
      heartCircleOutline,
      heartOutline,
      clipboardOutline,
      golfOutline,
      calendarNumberOutline,
    });
  }

  ngOnInit() {}
}
