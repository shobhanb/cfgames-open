import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';

interface JudgeSummary {
  judgeName: string;
  count: number;
}

@Component({
  selector: 'app-judge-summary-modal',
  templateUrl: './judge-summary-modal.component.html',
  styleUrls: ['./judge-summary-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
  ],
})
export class JudgeSummaryModalComponent {
  @Input() shortName = '';
  @Input() judgeSummary: JudgeSummary[] = [];

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
