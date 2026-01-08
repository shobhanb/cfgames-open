import {
  Component,
  computed,
  inject,
  Input,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonRouterLink,
  IonChip,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationResults } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { RouterLink } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';
import { TeamNamePipe } from '../../../../pipes/team-name.pipe';

@Component({
  selector: 'app-appreciation-result',
  templateUrl: './appreciation-result.page.html',
  styleUrls: ['./appreciation-result.page.scss'],
  standalone: true,
  imports: [
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSkeletonText,
    IonLabel,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    RouterLink,
    IonRouterLink,
    IonChip,
    TeamNamePipe,
  ],
})
export class AppreciationResultPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);
  private toastService = inject(ToastService);
  private config = inject(AppConfigService);
  athleteDataService = inject(AthleteDataService);

  eventService = inject(EventService);

  @Input({ required: true, transform: numberAttribute }) year!: number;
  @Input({ required: true, transform: numberAttribute }) ordinal!: number;

  private appreciationResults = signal<apiAppreciationResults[]>([]);

  sortBy = signal<'total_votes' | 'team_votes' | 'non_team_votes'>(
    'total_votes'
  );

  readonly sortedResults = computed(() => {
    return this.appreciationResults().sort(
      (a: apiAppreciationResults, b: apiAppreciationResults) => {
        const sortKey = this.sortBy();
        return b[sortKey] - a[sortKey];
      }
    );
  });

  dataLoaded = signal<boolean>(false);

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiAppreciation
      .getAppreciationResultsAppreciationResultsGet({
        affiliate_id: this.config.affiliateId,
        year: this.year,
        ordinal: this.ordinal,
      })
      .subscribe({
        next: (data: apiAppreciationResults[]) => {
          this.appreciationResults.set(data);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error fetching appreciation results:', error);
          this.toastService.showToast(
            `Failed to load appreciation results${
              error?.error?.detail ? ': ' + error.error.detail : ''
            }`,
            'danger',
            null,
            3000
          );
        },
      });
  }

  handleSortChange(event: CustomEvent) {
    const selectedValue = event.detail.value as
      | 'total_votes'
      | 'team_votes'
      | 'non_team_votes';
    this.sortBy.set(selectedValue);
  }
}
