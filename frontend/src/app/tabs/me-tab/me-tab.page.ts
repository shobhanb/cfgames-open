import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonCardHeader,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../shared/auth-state/auth-state.component';
import { ThemeComponent } from '../../shared/theme/theme.component';

@Component({
  selector: 'app-me-tab',
  templateUrl: './me-tab.page.html',
  styleUrls: ['./me-tab.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    AuthStateComponent,
    ThemeComponent,
  ],
})
export class MeTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
