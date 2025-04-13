import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AthleteIDs } from './athlete-ids';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);

  private athleteIdApiUrl = 'athlete_data.json';

  loadAthleteIds() {
    return this.http.get<AthleteIDs[]>(this.athleteIdApiUrl);
  }

  constructor() {}
}
