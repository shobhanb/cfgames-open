import { Component, signal, computed } from '@angular/core';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, statsChart, close } from 'ionicons/icons';

export interface AthletePreference {
  athleteName: string;
  preferences: string[];
  firstPreference: string;
}

export interface PrefSummary {
  heat: string;
  count: number;
}

@Component({
  selector: 'app-athlete-prefs-modal',
  templateUrl: './athlete-prefs-modal.component.html',
  styleUrls: ['./athlete-prefs-modal.component.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule,
  ],
})
export class AthletePrefsModalComponent {
  athletePrefs = signal<AthletePreference[]>([]);
  summary = signal<PrefSummary[]>([]);

  // Group athletes by their first preference
  groupedAthletes = computed(() => {
    const athletes = this.athletePrefs();
    const groups = new Map<string, AthletePreference[]>();

    athletes.forEach((athlete) => {
      const firstPref = athlete.firstPreference;
      const existing = groups.get(firstPref) || [];
      existing.push(athlete);
      groups.set(firstPref, existing);
    });

    // Convert to array and sort by preference name
    return Array.from(groups.entries())
      .map(([preference, athletes]) => ({
        preference,
        athletes: athletes.sort((a, b) =>
          a.athleteName.localeCompare(b.athleteName)
        ),
      }))
      .sort((a, b) => a.preference.localeCompare(b.preference));
  });

  constructor(private modalController: ModalController) {
    addIcons({ person, statsChart, close });
  }

  scrollToPreference(preference: string) {
    const elementId = `pref-${preference}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
