import { Component, inject, OnInit } from '@angular/core';
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
  clipboardOutline,
  heartCircleOutline,
  calendarNumberOutline,
} from 'ionicons/icons';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AffiliateConfigService } from 'src/app/services/affiliate-config.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AuthService } from 'src/app/services/auth.service';

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
  config = inject(AppConfigService);
  affiliateConfig = inject(AffiliateConfigService);
  private authService = inject(AuthService);

  isJudge = this.authService.athlete()?.judge || false;

  constructor() {
    addIcons({
      calendarOutline,
      clipboardOutline,
      calendarNumberOutline,
      heartOutline,
      heartCircleOutline,
      barChartOutline,
      peopleCircleOutline,
      cogOutline,
    });
  }

  ngOnInit() {}
}
