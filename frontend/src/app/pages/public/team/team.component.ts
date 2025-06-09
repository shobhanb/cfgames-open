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
import { ScoreService } from '../../../shared/score-filter/score.service';
import { ScoreLegendComponent } from '../../../shared/score-legend/score-legend.component';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { environment } from '../../../../environments/environment';
import { HelperFunctionsService } from '../../../shared/helper-functions.service';
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
  scoreService = inject(ScoreService);
  userAuth = inject(UserAuthService);

  eventsList = Object.entries(environment.ordinalMap);
  showTotalScores = signal<boolean>(false);

  teamScores = computed<apiTeamScoreModel[]>(() =>
    this.showTotalScores()
      ? this.scoreService.teamScoresTotal()
      : this.scoreService.filteredTeamScores()
  );

  constructor() {
    this.dockService.setPublic();
    effect(() => {
      this.titleService.pageTitle.set(
        `Team Scores ${this.scoreService.filteredEvent()}`
      );
    });
  }

  ngOnInit(): void {
    this.scoreService.getTeamScores();
  }

  onChangeFilter(event: Event, type: 'event') {
    const target = event.target as HTMLSelectElement;
    if (type === 'event' && target.value) {
      if (target.value === 'Total') {
        this.showTotalScores.set(true);
      } else {
        this.scoreService.setFilter({ ordinal: Number(target.value) });
        this.showTotalScores.set(false);
      }
    }
  }
}
