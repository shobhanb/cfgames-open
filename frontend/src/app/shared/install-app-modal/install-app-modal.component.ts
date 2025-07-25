import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  arrowDownCircleOutline,
  shareOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-install-app-modal',
  templateUrl: './install-app-modal.component.html',
  styleUrls: ['./install-app-modal.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonCheckbox,
  ],
})
export class InstallAppModalComponent implements OnInit {
  private modalController = inject(ModalController);

  dontShowAgain = signal(false);

  constructor() {
    addIcons({
      closeOutline,
      arrowDownCircleOutline,
      shareOutline,
    });
  }

  ngOnInit() {}

  toggleDontShowAgain(event: Event) {
    const checkbox = event.target as HTMLIonCheckboxElement;
    this.dontShowAgain.set(checkbox.checked);
  }

  closeModal() {
    this.modalController.dismiss({
      dontShowAgain: this.dontShowAgain(),
    });
  }
}
