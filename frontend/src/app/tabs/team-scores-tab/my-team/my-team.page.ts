import { Component, computed, inject, OnInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonCard,
} from '@ionic/angular/standalone';
import { apiAthleteDetail } from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { ScoreFilterService } from 'src/app/services/score-filter.service';
import { HelperFunctionsService } from 'src/app/services/helper-functions.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
  standalone: true,
  imports: [
    IonCard,
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
    IonSelect,
    IonSelectOption,
  ],
})
export class MyTeamPage implements OnInit {
  private helperFunctions = inject(HelperFunctionsService);
  private authService = inject(AuthService);
  scoreFilter = inject(ScoreFilterService);
  athleteDataService = inject(AthleteDataService);

  constructor() {}

  dataLoaded = computed(() => !this.athleteDataService.loading());
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

  teamsList = computed<string[]>(() => [
    'All',
    ...this.athleteDataService
      .athleteData()
      .map((athlete) => athlete.team_name)
      .filter(this.helperFunctions.filterUnique),
  ]);

  readonly filteredAthletes = computed<apiAthleteDetail[]>(() =>
    this.athleteDataService
      .athleteData()
      .filter(
        (value: apiAthleteDetail) =>
          value.gender === this.scoreFilter.filter().gender &&
          value.age_category === this.scoreFilter.filter().ageCategory &&
          (this.scoreFilter.filter().team === 'All' ||
            value.team_name === this.scoreFilter.filter().team)
      )
      .sort((a: apiAthleteDetail, b: apiAthleteDetail) =>
        a.name > b.name ? 1 : -1
      )
  );

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private async getData() {
    await this.athleteDataService.getData();
    this.scoreFilter.setFilter({ team: this.myTeamName });
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
