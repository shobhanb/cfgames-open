import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonCardContent,
  IonAccordionGroup,
  IonAccordion,
  IonFab,
  IonFabButton,
  IonCardSubtitle,
  IonFabList,
  IonRouterLink,
  IonText,
} from '@ionic/angular/standalone';
import {
  apiAppreciationService,
  apiAppreciationStatusService,
} from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  apiAppreciationModel,
  apiAppreciationStatusModel,
  apiAthleteDetail,
} from 'src/app/api/models';
import { addIcons } from 'ionicons';
import { addOutline, peopleCircleOutline, globeOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appreciation',
  templateUrl: './appreciation.page.html',
  styleUrls: ['./appreciation.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonFabList,
    IonCardSubtitle,
    IonFabButton,
    IonFab,
    IonAccordion,
    IonAccordionGroup,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonCardContent,
    ToolbarButtonsComponent,
    ReactiveFormsModule,
    RouterLink,
    IonRouterLink,
  ],
})
export class AppreciationPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);
  private apiAppreciationStatus = inject(apiAppreciationStatusService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  eventService = inject(EventService);
  athleteDataService = inject(AthleteDataService);

  dataLoaded = false;
  readonly appreciations = signal<apiAppreciationModel[]>([]);
  private readonly appreciationStatus = signal<apiAppreciationStatusModel[]>(
    []
  );

  headerContent = computed(() => {
    if (this.availableEvents().length > 0) {
      return 'Click the + button to cast your appreciation for an athlete';
    } else {
      return 'No available events for appreciation. Please check back later.';
    }
  });

  private readonly teamAthletes = computed<apiAthleteDetail[]>(() =>
    this.athleteDataService
      .athleteData()
      .filter((a) => a.team_name === this.authService.athlete()?.team_name)
  );

  private readonly nonTeamAthletes = computed<apiAthleteDetail[]>(() =>
    this.athleteDataService
      .athleteData()
      .filter((a) => a.team_name != this.authService.athlete()?.team_name)
  );

  readonly availableEvents = computed<apiAppreciationStatusModel[]>(() =>
    this.appreciationStatus().filter(
      (status) =>
        !this.appreciations().some(
          (appreciation) =>
            appreciation.year === status.year &&
            appreciation.ordinal === status.ordinal
        )
    )
  );

  constructor() {
    addIcons({
      peopleCircleOutline,
      globeOutline,
      addOutline,
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataLoaded = false;

    let appreciationDataLoaded = false;
    let appreciationStatusDataLoaded = false;

    this.apiAppreciation
      .getMyAppreciationAppreciationGet({
        year: environment.year,
      })
      .subscribe({
        next: (data) => {
          this.appreciations.set(
            data.sort((a, b) => {
              if (a.year !== b.year) {
                return b.year - a.year; // Sort by year descending
              }
              return b.ordinal - a.ordinal; // Sort by ordinal descending
            })
          );
          appreciationDataLoaded = true;
          this.dataLoaded =
            appreciationDataLoaded && appreciationStatusDataLoaded;
        },
        error: (error) => {
          console.error('Error fetching appreciations:', error);
          this.toastService.showToast(
            'Failed to load appreciation data',
            'danger',
            null,
            3000
          );
          this.dataLoaded = true;
        },
      });

    this.apiAppreciationStatus
      .getOpenAppreciationStatusAppreciationStatusGet({
        year: environment.year,
      })
      .subscribe({
        next: (data) => {
          this.appreciationStatus.set(data);
          appreciationStatusDataLoaded = true;
          this.dataLoaded =
            appreciationDataLoaded && appreciationStatusDataLoaded;
        },
        error: (error) => {
          console.error('Error fetching appreciation status:', error);
          this.toastService.showToast(
            'Failed to load appreciation status',
            'danger',
            null,
            3000
          );
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.loadData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  checkIfAppreciationStatusOpen(ordinal: number, year: number): boolean {
    const status = this.appreciationStatus().find(
      (s) => s.ordinal === ordinal && s.year === year
    );
    return status ? true : false;
  }

  onClickDelete(appreciation: apiAppreciationModel) {
    this.apiAppreciation
      .deleteMyAppreciationAppreciationDelete({
        year: appreciation.year,
        ordinal: appreciation.ordinal,
      })
      .subscribe({
        next: () => {
          this.appreciations.update((appreciations) =>
            appreciations.filter(
              (a) =>
                a.year !== appreciation.year ||
                a.ordinal !== appreciation.ordinal
            )
          );
          this.toastService.showToast(
            'Appreciation deleted successfully',
            'success',
            null,
            3000
          );
        },
        error: (error) => {
          console.error('Error deleting appreciation:', error);
          this.toastService.showToast(
            'Failed to delete appreciation',
            'danger',
            null,
            3000
          );
        },
      });
  }
}
