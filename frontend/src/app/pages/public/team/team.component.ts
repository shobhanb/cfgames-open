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
import { DockService } from '../../../shared/pages/dock/dock.service';
import { ScoreLegendComponent } from '../../../shared/score-legend/score-legend.component';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { environment } from '../../../../environments/environment';
import {
  heroHeart,
  heroHandRaised,
  heroScale,
  heroUserGroup,
  heroChevronDown,
  heroChevronUp,
} from '@ng-icons/heroicons/outline';
import { ionMedalOutline, ionBarbellOutline } from '@ng-icons/ionicons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { apiTeamScoreModel } from '../../../api/models';
import {
  AGE_CATEGORIES,
  GENDERS,
  ScoreFilterService,
} from '../../../shared/score-filter.service';
import { apiScoreService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';

@Component({
  selector: 'app-team',
  imports: [NgIcon, PagesComponent, ScoreLegendComponent],
  viewProviders: [
    provideIcons({
      heroHeart,
      heroScale,
      heroHandRaised,
      ionMedalOutline,
      ionBarbellOutline,
      heroUserGroup,
      heroChevronDown,
      heroChevronUp,
    }),
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private helperFunctions = inject(HelperFunctionsService);
  private apiScore = inject(apiScoreService);
  scoreFilter = inject(ScoreFilterService);
  userAuth = inject(UserAuthService);

  showFilter = signal<boolean>(false);
  eventsList = Object.entries(environment.ordinalMap);
  gendersList = GENDERS;
  ageCategoriesList = AGE_CATEGORIES;

  private _teamScores = signal<apiTeamScoreModel[]>([]);

  readonly teams = computed<string[]>(() => [
    ...this._teamScores()
      .map((value: apiTeamScoreModel) => value.team_name)
      .filter(this.helperFunctions.filterUnique)
      .sort(),
    'All',
  ]);

  readonly filteredTeamScores = computed<apiTeamScoreModel[]>(() =>
    this._teamScores().filter(
      (value: apiTeamScoreModel) =>
        this.scoreFilter.filter().ordinalTotals ||
        value.ordinal === this.scoreFilter.filter().ordinal
    )
  );

  readonly aggregatedTeamScores = computed<apiTeamScoreModel[]>(() => {
    const scoreMap = new Map<string, apiTeamScoreModel>();

    this.filteredTeamScores().forEach((score: apiTeamScoreModel) => {
      const existingScore = scoreMap.get(score.team_name);

      if (!existingScore) {
        scoreMap.set(score.team_name, { ...score });
      } else {
        existingScore.appreciation_score += score.appreciation_score;
        existingScore.judge_score += score.judge_score;
        existingScore.attendance_score += score.attendance_score;
        existingScore.top3_score += score.top3_score;
        existingScore.participation_score += score.participation_score;
        existingScore.side_challenge_score += score.side_challenge_score;
        existingScore.spirit_score += score.spirit_score;
        existingScore.total_team_score += score.total_team_score;
      }
    });

    // Sort team scores by total team score descending
    return Array.from(scoreMap.values()).sort(
      (a: apiTeamScoreModel, b: apiTeamScoreModel) =>
        b.total_team_score - a.total_team_score
    );
  });

  constructor() {
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `${
          this.scoreFilter.filter().ordinalTotals
            ? 'Total'
            : this.scoreFilter.filteredEvent()
        } Team Scores`
      );
    });
  }

  ngOnInit(): void {
    this.apiScore
      .getTeamScoresScoreTeamGet$Response({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (response: StrictHttpResponse<apiTeamScoreModel[]>) => {
          this._teamScores.set(response.body);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  onChangeFilter(event: Event, type: string) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      if (type === 'event') {
        if (target.value === 'Total') {
          this.scoreFilter.setFilter({ ordinalTotals: true });
        } else {
          this.scoreFilter.setFilter({
            ordinalTotals: false,
            ordinal: Number(target.value),
          });
        }
      }
    }
  }
}
