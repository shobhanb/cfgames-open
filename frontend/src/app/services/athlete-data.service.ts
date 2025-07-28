import { inject, Injectable, signal } from '@angular/core';
import { apiAthleteService } from '../api/services';
import { apiAthleteDetail } from '../api/models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class AthleteDataService {
  private apiAthlete = inject(apiAthleteService);
  private config = inject(AppConfigService);

  readonly athleteData = signal<apiAthleteDetail[]>([]);
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
