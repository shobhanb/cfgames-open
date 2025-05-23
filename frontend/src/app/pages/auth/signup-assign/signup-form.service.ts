import { computed, inject, Injectable, signal } from '@angular/core';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';
import { apiAffiliateAthlete } from '../../../api/models';
import { apiAthleteService } from '../../../api/services';

@Injectable({
  providedIn: 'root',
})
export class SignupFormService {
  private helperFunctions = inject(HelperFunctionsService);
  private apiAthlete = inject(apiAthleteService);

  // Athlete data from API
  athleteData = signal<apiAffiliateAthlete[]>([]);

  // This needs to be called by the component onInit
  getAthleteData() {
    this.apiAthlete.getAthleteListAthleteListGet().subscribe({
      next: (data: apiAffiliateAthlete[]) => {
        this.athleteData.set(data);
      },
      error: (err: any) => {
        console.log('Error getting Athlete List', err);
        this.athleteData.set([]);
      },
    });
  }

  // Input data split into gyms, names etc
  gyms = computed<string[]>(() =>
    this.athleteData()
      .map((athlete) => athlete.affiliate_name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  names = computed<string[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.affiliate_name === this.selectedAffiliate())
      .map((athlete) => athlete.name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  athleteIds = computed<number[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.affiliate_name === this.selectedAffiliate())
      .filter((athlete) => athlete.name === this.selectedName())
      .map((athlete) => athlete.competitor_id)
      .sort()
  );

  // To store the form data
  selectedAffiliate = signal<string | null>(null);
  selectedName = signal<string | null>(null);
  selectedAthleteId = signal<number | null>(null);
  enteredEmail = signal<string | null>(null);

  selectedAffiliateId = computed<number | null>(() => {
    return this.athleteData()
      .filter((athlete) => athlete.competitor_id === this.selectedAthleteId())
      .map((athlete) => athlete.affiliate_id)
      .filter(this.helperFunctions.filterUnique)[0];
  });

  // Check if inputs are valid
  // Use to switch components
  selectionValid = computed<boolean>(
    () =>
      !!this.selectedAffiliate() &&
      !!this.selectedAffiliateId() &&
      !!this.selectedName() &&
      !!this.selectedAthleteId() &&
      !!this.enteredEmail()
  );
}
