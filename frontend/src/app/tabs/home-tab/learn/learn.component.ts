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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  syncOutline,
  settingsOutline,
  archiveOutline,
} from 'ionicons/icons';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
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
  config = inject(AppConfigService);

  constructor() {
    addIcons({
      closeOutline,
      syncOutline,
      settingsOutline,
      archiveOutline,
    });
  }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }
}
