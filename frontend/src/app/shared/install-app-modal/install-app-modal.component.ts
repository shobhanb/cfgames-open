import { Component, inject, Input, OnInit } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  arrowDownCircleOutline,
  shareOutline,
  ellipsisVerticalOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-install-app-modal',
  templateUrl: './install-app-modal.component.html',
  styleUrls: ['./install-app-modal.component.scss'],
  imports: [
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
  ],
})
export class InstallAppModalComponent implements OnInit {
  private modalController = inject(ModalController);

  @Input() platformType: 'ios' | 'android' = 'ios';

  constructor() {
    addIcons({
      closeOutline,
      arrowDownCircleOutline,
      shareOutline,
      ellipsisVerticalOutline,
    });
  }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }
}
