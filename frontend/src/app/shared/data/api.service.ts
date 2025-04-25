import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AffiliateAthletes } from './athlete-ids';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);

  private athleteIdApiUrl = `${environment.apiUrl}/athlete/list`;

  loadAthleteIds() {
    return this.http.get<AffiliateAthletes[]>(this.athleteIdApiUrl);
  }

  constructor() {}
}
