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
  IonSkeletonText,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonChip,
  IonCardContent,
  IonCardHeader,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  womanOutline,
  manOutline,
  checkmarkCircle,
} from 'ionicons/icons';
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
    IonCardHeader,
    IonCardContent,
    IonCard,
    IonSkeletonText,
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
    IonChip,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class MyTeamPage implements OnInit {
  private helperFunctions = inject(HelperFunctionsService);
  private authService = inject(AuthService);
  scoreFilter = inject(ScoreFilterService);
  athleteDataService = inject(AthleteDataService);

  constructor() {
    addIcons({ peopleOutline, womanOutline, manOutline, checkmarkCircle });
  }

  dataLoaded = computed(() => !this.athleteDataService.loading());
  myTeamName = this.authService.athlete()?.team_name || '';
  myCrossfitId = this.authService.userCustomClaims()?.crossfit_id;

  teamSectionTitle = computed(() =>
    this.scoreFilter.filter().team.replace(/^\s*\d+\.?\s*/, '')
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
          this.scoreFilter.filter().team === 'All' ||
          value.team_name === this.scoreFilter.filter().team
      )
      .sort((a: apiAthleteDetail, b: apiAthleteDetail) =>
        a.name > b.name ? 1 : -1
      )
  );

  readonly filtereedAthletesByGender = computed<{
    M: apiAthleteDetail[];
    F: apiAthleteDetail[];
  }>(() => {
    const m = this.filteredAthletes().filter((a) => a.gender === 'M');
    const f = this.filteredAthletes().filter((a) => a.gender === 'F');
    return { M: m, F: f };
  });

  readonly summaryMetrics = computed(() => {
    const athletes = this.filteredAthletes();
    const maleOpen = athletes.filter(
      (a) => a.gender === 'M' && a.age_category === 'Open'
    ).length;
    const maleMasters = athletes.filter(
      (a) => a.gender === 'M' && a.age_category === 'Masters'
    ).length;
    const maleMasters55 = athletes.filter(
      (a) => a.gender === 'M' && a.age_category === 'Masters 55+'
    ).length;
    const femaleOpen = athletes.filter(
      (a) => a.gender === 'F' && a.age_category === 'Open'
    ).length;
    const femaleMasters = athletes.filter(
      (a) => a.gender === 'F' && a.age_category === 'Masters'
    ).length;
    const femaleMasters55 = athletes.filter(
      (a) => a.gender === 'F' && a.age_category === 'Masters 55+'
    ).length;
    const totalJudges = athletes.filter((a) => a.judge).length;

    return {
      total: athletes.length,
      male: {
        Open: maleOpen,
        Masters: maleMasters,
        'Masters 55+': maleMasters55,
      },
      female: {
        Open: femaleOpen,
        Masters: femaleMasters,
        'Masters 55+': femaleMasters55,
      },
      judges: totalJudges,
    };
  });

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

  onSelectionChanged(event: CustomEvent) {
    this.scoreFilter.setFilter({ team: event.detail.value });
  }
}
