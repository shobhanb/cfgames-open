import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonList,
  IonItem,
  IonToolbar,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonCardHeader,
  IonButton,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-me-tab',
  templateUrl: './me-tab.page.html',
  styleUrls: ['./me-tab.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonContent,
    IonHeader,
    IonList,
    IonItem,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class MeTabPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
