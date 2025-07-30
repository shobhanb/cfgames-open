import { computed, inject, Injectable, signal } from '@angular/core';
import { apiAthleteService } from '../api/services';
import { apiAthleteDetail } from '../api/models';
import { AppConfigService } from './app-config.service';
import { HelperFunctionsService } from './helper-functions.service';

@Injectable({ providedIn: 'root' })
export class AthleteDataService {
  private apiAthlete = inject(apiAthleteService);
  private helperFunctions = inject(HelperFunctionsService);
  private config = inject(AppConfigService);

  readonly athleteData = signal<apiAthleteDetail[]>([]);

  readonly teamNames = computed(() =>
    this.athleteData()
      .map((data: apiAthleteDetail) => data.team_name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  readonly teamCounts = computed(() => {
    const counts = new Map<string, number>();
    this.athleteData().forEach((athlete) => {
      const teamName = athlete.team_name;
      counts.set(teamName, (counts.get(teamName) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([teamName, count]) => ({ teamName, count }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  });
  readonly loading = signal<boolean>(false);

  getData(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.apiAthlete
        .getAthleteDetailAllAthleteDetailAllGet({
          affiliate_id: this.config.affiliateId,
          year: this.config.year,
        })
        .subscribe({
          next: (data: apiAthleteDetail[]) => {
            this.athleteData.set(
              data.sort((a, b) => a.name.localeCompare(b.name))
            );
            this.loading.set(false);
            resolve();
          },
          error: (error) => {
            this.loading.set(false);
            reject(error);
          },
        });
    });
  }

  getAthleteName(crossfitId: number): string | null {
    const athlete = this.athleteData().find(
      (a) => a.crossfit_id === crossfitId
    );
    return athlete?.name || null;
  }

  getCrossfitId(name: string): number | null {
    const athlete = this.athleteData().find((a) => a.name === name);
    return athlete?.crossfit_id || null;
  }

  constructor() {
    this.getData();
  }
}
