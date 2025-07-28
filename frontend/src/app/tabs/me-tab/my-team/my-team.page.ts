import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { apiAthleteService } from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';
import { apiAthleteDetail } from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { ScoreFilterService } from 'src/app/services/score-filter.service';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    IonSegmentButton,
    IonSegment,
    IonLabel,
    IonItem,
    IonList,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    TeamNamePipe,
  ],
})
export class MyTeamPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private helperFunctions = inject(HelperFunctionsService);
  private authService = inject(AuthService);
  private config = inject(AppConfigService);
  scoreFilter = inject(ScoreFilterService);
  athleteDataService = inject(AthleteDataService);

  constructor() {}

  dataLoaded = false;
  myTeamName = this.authService.athlete()?.team_name || '';
  myCrossfitId = this.authService.userCustomClaims()?.crossfit_id;

  teamSectionTitle = computed(
    () =>
      this.scoreFilter.filter().team.replace(/^\s*\d+\.?\s*/, '') +
      ' - ' +
      this.scoreFilter.filter().gender +
      ' - ' +
      this.scoreFilter.filter().ageCategory
  );

  athletes = signal<apiAthleteDetail[]>([]);

  teamsList = computed(() =>
    this.athleteDataService
      .athleteData()
      .map((athlete) => athlete.team_name)
      .filter(this.helperFunctions.filterUnique)
  );

  readonly filteredAthletes = computed<apiAthleteDetail[]>(() =>
    this.athleteDataService
      .athleteData()
      .filter(
        (value: apiAthleteDetail) =>
          value.gender === this.scoreFilter.filter().gender &&
          value.age_category === this.scoreFilter.filter().ageCategory &&
          value.team_name === this.scoreFilter.filter().team
      )
      .sort((a: apiAthleteDetail, b: apiAthleteDetail) =>
        a.name > b.name ? 1 : -1
      )
  );

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private async getData() {
    this.dataLoaded = false;
    await this.apiAthlete
      .getAthleteDetailAllAthleteDetailAllGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data: apiAthleteDetail[]) => {
          this.athletes.set(data);
          this.dataLoaded = true;

          const myTeamName = data.find(
            (athlete) => athlete.crossfit_id === this.myCrossfitId
          )?.team_name;
          if (myTeamName) {
            this.scoreFilter.setFilter({ team: myTeamName });
          }
        },
        error: (err: any) => {
          this.toastService.showToast(err.message, 'danger', null, 3000);
        },
      });
  }

  onSelectionChanged(
    event: CustomEvent,
    type: 'gender' | 'ageCategory' | 'team'
  ) {
    if (type === 'gender') {
      this.scoreFilter.setFilter({ gender: event.detail.value });
    } else if (type === 'ageCategory') {
      this.scoreFilter.setFilter({ ageCategory: event.detail.value });
    } else if (type === 'team') {
      this.scoreFilter.setFilter({ team: event.detail.value });
    }
  }
}
