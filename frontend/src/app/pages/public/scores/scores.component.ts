import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import {
  AGE_CATEGORIES,
  AgeCategory,
  Gender,
  GENDERS,
  ScoreService,
} from '../../../shared/score-filter/score.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroHeart,
  heroHandRaised,
  heroScale,
} from '@ng-icons/heroicons/outline';
import { ionMedalOutline, ionBarbellOutline } from '@ng-icons/ionicons';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { ScoreLegendComponent } from '../../../shared/score-legend/score-legend.component';
import { apiScoreModel } from '../../../api/models';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-scores',
  imports: [NgIcon, PagesComponent, ScoreLegendComponent],
  viewProviders: [
    provideIcons({
      heroHeart,
      heroScale,
      heroHandRaised,
      ionMedalOutline,
      ionBarbellOutline,
    }),
  ],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.css',
})
export class ScoresComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private helperFunctions = inject(HelperFunctionsService);
  scoreService = inject(ScoreService);
  userAuth = inject(UserAuthService);

  showFilter = signal<boolean>(false);
  eventsList = Object.entries(environment.ordinalMap);
  gendersList = GENDERS;
  ageCategoriesList = AGE_CATEGORIES;

  scoreFilterDisplay = computed<string>(() => {
    const filter = this.scoreService.scoreFilter();

    let display = '';
    if (filter.gender && filter.gender !== 'All') {
      display += filter.gender;
    }
    if (filter.ageCategory && filter.ageCategory !== 'All') {
      display += (display ? ' - ' : '') + filter.ageCategory;
    }
    if (filter.team && filter.team !== 'All') {
      display += (display ? ' - ' : '') + filter.team;
    }

    return display === '' ? 'All' : display;
  });

  readonly teams = computed<string[]>(() =>
    this.scoreService
      .filteredIndividualScores()
      .map((value: apiScoreModel) => value.team_name || '')
      .filter(this.helperFunctions.filterUnique)
      .sort()
  );

  readonly showScores = computed<apiScoreModel[]>(() =>
    this.scoreService
      .filteredIndividualScores()
      .filter(
        (value: apiScoreModel) =>
          this.scoreService.scoreFilter().team === 'All' ||
          value.team_name === this.scoreService.scoreFilter().team
      )
      .sort((a: apiScoreModel, b: apiScoreModel) => (a.name > b.name ? 1 : -1))
  );

  constructor() {
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${this.scoreService.filteredEvent()} Scores`
      );
    });
  }

  ngOnInit(): void {
    this.scoreService.getScores();
  }

  onChangeFilter(
    event: Event,
    type: 'event' | 'gender' | 'ageCategory' | 'team'
  ) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      if (type === 'event') {
        this.scoreService.setFilter({ ordinal: Number(target.value) });
      } else if (type === 'gender') {
        this.scoreService.setFilter({ gender: target.value as Gender });
      } else if (type === 'ageCategory') {
        this.scoreService.setFilter({
          ageCategory: target.value as AgeCategory,
        });
      } else if (type === 'team') {
        this.scoreService.setFilter({
          team: target.value,
        });
      }
    }
  }
}
