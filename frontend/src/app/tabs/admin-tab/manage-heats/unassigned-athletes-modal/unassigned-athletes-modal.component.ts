import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, time, close } from 'ionicons/icons';

export interface UnassignedAthlete {
  name: string;
  preferences: string;
}

@Component({
  selector: 'app-unassigned-athletes-modal',
  templateUrl: './unassigned-athletes-modal.component.html',
  styleUrls: ['./unassigned-athletes-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    CommonModule,
  ],
})
export class UnassignedAthletesModalComponent {
  unassignedAthletes = input.required<UnassignedAthlete[]>();

  // Group athletes by their first preference
  groupedAthletes = computed(() => {
    const athletes = this.unassignedAthletes();
    const groups = new Map<string, UnassignedAthlete[]>();

    athletes.forEach((athlete) => {
      // Get the first preference (before the first comma)
      const firstPref = athlete.preferences
        ? athlete.preferences.split(',')[0].trim()
        : 'No preferences';

      const existing = groups.get(firstPref) || [];
      existing.push(athlete);
      groups.set(firstPref, existing);
    });

    // Convert to array and sort by preference name
    return Array.from(groups.entries())
      .map(([preference, athletes]) => ({
        preference,
        athletes: athletes.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => {
        // Put "No preferences" at the end
        if (a.preference === 'No preferences') return 1;
        if (b.preference === 'No preferences') return -1;
        return a.preference.localeCompare(b.preference);
      });
  });

  constructor(private modalController: ModalController) {
    addIcons({ person, time, close });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
