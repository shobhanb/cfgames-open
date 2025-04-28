import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../shared/data/api.service';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';
import { AffiliateAthletes } from '../../../shared/data/athlete-ids';
import { ModalService } from '../../../shared/modal/modal.service';
import { AuthService } from '../../../shared/auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignupFormService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private helperFunctions = inject(HelperFunctionsService);
  private modalService = inject(ModalService);

  // To store the form data
  selectedGym = signal<string | null>(null);
  selectedName = signal<string | null>(null);
  selectedAthleteId = signal<number | null>(null);
  // Form data is valid
  selectionValid = computed<boolean>(
    () =>
      !!this.selectedGym() &&
      !!this.selectedName() &&
      !!this.selectedAthleteId()
  );

  // Affiliate & Athlete data from API
  athleteData = signal<AffiliateAthletes[]>([]).asReadonly();

  gyms = computed<string[]>(() =>
    this.athleteData()
      .map((athlete) => athlete.affiliate_name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  names = computed<string[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.affiliate_name === this.selectedGym())
      .map((athlete) => athlete.name)
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  athleteIds = computed<number[]>(() =>
    this.athleteData()
      .filter((athlete) => athlete.affiliate_name === this.selectedGym())
      .filter((athlete) => athlete.name === this.selectedName())
      .map((athlete) => athlete.competitor_id)
      .sort()
  );

  constructor() {
    // Observable from API converted to signal
    this.athleteData = toSignal(this.api.loadAthleteIds(), {
      initialValue: [],
    });
  }
}
