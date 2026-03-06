import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRouterLink,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  codeOutline,
  bodyOutline,
  codeWorkingOutline,
  codeSlashOutline,
  clipboardOutline,
  golfOutline,
  calendarNumberOutline,
  heartOutline,
  heartCircleOutline,
  homeOutline,
  globeOutline,
} from 'ionicons/icons';
import { AffiliateConfigService } from 'src/app/services/affiliate-config.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { JudgeAvailabilityModalComponent } from './manage-heats/judge-availability-modal/judge-availability-modal.component';
import { AthletePrefsModalComponent } from './manage-heats/athlete-prefs-modal/athlete-prefs-modal.component';
import { apiAthletePrefsOutputModel } from 'src/app/api/models';
import { apiAthletePrefsService } from 'src/app/api/services';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToastService } from 'src/app/services/toast.service';

import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-admin-tab',
  templateUrl: './admin-tab.page.html',
  styleUrls: ['./admin-tab.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonIcon,
    IonLabel,
    IonItem,
    IonList,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonContent,
    ToolbarButtonsComponent,
    IonRouterLink,
    RouterLink,
  ],
})
export class AdminTabPage implements OnInit {
  affiliateConfig = inject(AffiliateConfigService);
  private appConfig = inject(AppConfigService);
  private modalController = inject(ModalController);
  private apiAthletePrefs = inject(apiAthletePrefsService);
  private eventService = inject(EventService);
  private athleteDataService = inject(AthleteDataService);
  private toastService = inject(ToastService);

  private athletePrefs = signal<apiAthletePrefsOutputModel[]>([]);
  private config = inject(AffiliateConfigService);

  constructor() {
    addIcons({
      codeOutline,
      codeWorkingOutline,
      codeSlashOutline,
      heartCircleOutline,
      heartOutline,
      clipboardOutline,
      golfOutline,
      calendarNumberOutline,
      globeOutline,
      bodyOutline,
      homeOutline,
    });
  }

  ngOnInit() {}

  private loadAthletePrefs(): Promise<void> {
    return new Promise((resolve) => {
      this.apiAthletePrefs
        .getAllAthletePrefsAthletePrefsAllGet({
          year: this.appConfig.year,
          affiliate_id: this.appConfig.affiliateId,
        })
        .subscribe({
          next: (prefs) => {
            this.athletePrefs.set(prefs);
            resolve();
          },
          error: (error) => {
            console.error('Error loading athlete prefs:', error);
            this.toastService.showToast(
              'Error loading athlete preferences',
              'danger',
            );
            resolve();
          },
        });
    });
  }

  async showAllJudgeAvailability() {
    const modal = await this.modalController.create({
      component: JudgeAvailabilityModalComponent,
    });

    await modal.present();
  }

  async showAllAthletePrefs() {
    await this.loadAthletePrefs();

    if (this.athletePrefs().length === 0) {
      this.toastService.showToast('No athlete preferences loaded', 'warning');
      return;
    }

    // Group athlete preferences by heat short name (1st preference only)
    const prefsByHeat = new Map<string, number>();
    const allPrefs: Array<{
      athleteName: string;
      preferences: string[];
      firstPreference: string;
    }> = [];

    // Helper to group preferences by athlete ID
    const prefsByAthlete = new Map<number, apiAthletePrefsOutputModel[]>();
    this.athletePrefs().forEach((pref) => {
      if (!pref.crossfit_id) return;
      const existing = prefsByAthlete.get(pref.crossfit_id) || [];
      existing.push(pref);
      prefsByAthlete.set(pref.crossfit_id, existing);
    });

    // Process grouped preferences
    prefsByAthlete.forEach((athletePrefs, crossfitId) => {
      const athlete = this.athleteDataService
        .athleteData()
        .find((a) => a.crossfit_id === crossfitId);

      if (!athlete) return;

      // Sort by preference number
      const sortedPrefs = athletePrefs.sort(
        (a, b) => a.preference_nbr - b.preference_nbr,
      );

      if (sortedPrefs.length > 0) {
        const firstPref = sortedPrefs[0].preference;
        const count = prefsByHeat.get(firstPref) || 0;
        prefsByHeat.set(firstPref, count + 1);

        allPrefs.push({
          athleteName: athlete.name,
          preferences: sortedPrefs.map((p) => p.preference),
          firstPreference: firstPref,
        });
      }
    });

    // Sort summary by count descending
    const summary = Array.from(prefsByHeat.entries())
      .map(([heat, count]) => ({ heat, count }))
      .sort((a, b) => b.count - a.count);

    // Sort athletes by first preference then name
    allPrefs.sort((a, b) => {
      const prefCompare = a.firstPreference.localeCompare(b.firstPreference);
      if (prefCompare !== 0) return prefCompare;
      return a.athleteName.localeCompare(b.athleteName);
    });

    const modal = await this.modalController.create({
      component: AthletePrefsModalComponent,
      componentProps: {
        athletePrefs: signal(allPrefs),
        summary: signal(summary),
      },
    });

    await modal.present();
  }
}
