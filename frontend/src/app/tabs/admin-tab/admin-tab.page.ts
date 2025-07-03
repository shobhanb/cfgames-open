import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../shared/auth-state/auth-state.component';

@Component({
  selector: 'app-admin-tab',
  templateUrl: './admin-tab.page.html',
  styleUrls: ['./admin-tab.page.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonTitle,
    IonHeader,
    IonCardTitle,
    IonCardContent,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    AuthStateComponent,
  ],
})
export class AdminTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
