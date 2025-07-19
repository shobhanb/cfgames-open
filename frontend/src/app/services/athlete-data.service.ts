import { inject, Injectable, signal } from '@angular/core';
import { apiAthleteService } from '../api/services';
import { environment } from 'src/environments/environment';
import { apiAthleteDetail } from '../api/models';

@Injectable({ providedIn: 'root' })
export class AthleteDataService {
  private apiAthlete = inject(apiAthleteService);

  readonly athleteData = signal<apiAthleteDetail[]>([]);
  readonly loading = signal<boolean>(false);

  getData(): Promise<void> {
    this.loading.set(true);
    return new Promise((resolve, reject) => {
      this.apiAthlete
        .getAthleteDetailAllAthleteDetailAllGet({
          affiliate_id: environment.affiliateId,
          year: environment.year,
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
