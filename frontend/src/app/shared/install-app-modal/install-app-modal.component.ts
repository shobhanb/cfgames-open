import { Component, inject, OnInit } from '@angular/core';
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
import { AppInstallService } from 'src/app/services/app-install.service';

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
  appInstallService = inject(AppInstallService);

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
