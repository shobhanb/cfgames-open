import { Component, Input, input, computed, signal } from '@angular/core';
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
  @Input() allJudgeNames: string[] = [];

  // Computed signal that includes all judges, even those with 0 assignments
  completeSummary = computed(() => {
    const assignedJudges = new Set(this.judgeSummary.map((j) => j.judgeName));

    // Add judges with 0 assignments
    const unassignedJudges = this.allJudgeNames
      .filter((name) => !assignedJudges.has(name))
      .map((name) => ({ judgeName: name, count: 0 }));

    // Combine and sort: assigned judges first (by count desc), then unassigned (alphabetically)
    const assigned = [...this.judgeSummary].sort((a, b) => b.count - a.count);
    const unassigned = unassignedJudges.sort((a, b) =>
      a.judgeName.localeCompare(b.judgeName)
    );

    return [...assigned, ...unassigned];
  });

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
