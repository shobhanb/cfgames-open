import { Component, inject, OnInit } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonLabel,
  IonNote,
  IonItem,
  IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
  imports: [
    IonList,
    IonItem,
    IonNote,
    IonLabel,
    IonContent,
    IonIcon,
    IonButton,
    IonButtons,
    IonTitle,
    IonHeader,
    IonToolbar,
  ],
})
export class LearnComponent implements OnInit {
  private modalController = inject(ModalController);

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }
}
