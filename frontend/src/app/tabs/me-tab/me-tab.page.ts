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
  cogOutline,
  barChartOutline,
  calendarOutline,
  heartOutline,
  peopleCircleOutline,
} from 'ionicons/icons';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-me-tab',
  templateUrl: './me-tab.page.html',
  styleUrls: ['./me-tab.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    ToolbarButtonsComponent,
    RouterLink,
    IonRouterLink,
  ],
})
export class MeTabPage implements OnInit {
  constructor() {
    addIcons({
      peopleCircleOutline,
      heartOutline,
      calendarOutline,
      barChartOutline,
      cogOutline,
    });
  }

  ngOnInit() {}
}
