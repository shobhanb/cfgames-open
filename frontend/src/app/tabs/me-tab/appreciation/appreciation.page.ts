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
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonText,
  IonCardContent,
  IonAccordionGroup,
  IonAccordion,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonInput,
  IonFab,
  IonFabButton,
  IonCardSubtitle,
  IonFabList,
  ModalController,
} from '@ionic/angular/standalone';
import {
  apiAppreciationService,
  apiAppreciationStatusService,
  apiAthleteService,
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
import {
  addOutline,
  createOutline,
  saveOutline,
  closeOutline,
  peopleOutline,
  personOutline,
  personCircleOutline,
  peopleCircleOutline,
  globeOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { EventService } from 'src/app/services/event.service';
import { EditAppreciationComponent } from './edit-appreciation/edit-appreciation.component';

@Component({
  selector: 'app-appreciation',
  templateUrl: './appreciation.page.html',
  styleUrls: ['./appreciation.page.scss'],
  standalone: true,
  imports: [
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
    IonLabel,
    IonList,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonText,
    IonCardContent,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    ToolbarButtonsComponent,
    ReactiveFormsModule,
  ],
})
export class AppreciationPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);
  private apiAppreciationStatus = inject(apiAppreciationStatusService);
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private modalController = inject(ModalController);
  eventService = inject(EventService);
  authService = inject(AuthService);

  dataLoaded = false;
  readonly appreciations = signal<apiAppreciationModel[]>([]);
  private readonly appreciationStatus = signal<apiAppreciationStatusModel[]>(
    []
  );
  private readonly allAthletes = signal<apiAthleteDetail[]>([]);

  private readonly teamAthletes = computed<apiAthleteDetail[]>(() =>
    this.allAthletes().filter(
      (a) => a.team_name === this.authService.athlete()?.team_name
    )
  );

  private readonly nonTeamAthletes = computed<apiAthleteDetail[]>(() =>
    this.allAthletes().filter(
      (a) => a.team_name != this.authService.athlete()?.team_name
    )
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
      personCircleOutline,
      createOutline,
      saveOutline,
      closeOutline,
      peopleOutline,
      personOutline,
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataLoaded = false;

    let appreciationDataLoaded = false;
    let appreciationStatusDataLoaded = false;
    let athleteDataLoaded = false;

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
            appreciationDataLoaded &&
            appreciationStatusDataLoaded &&
            athleteDataLoaded;
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
            appreciationDataLoaded &&
            appreciationStatusDataLoaded &&
            athleteDataLoaded;
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

    this.apiAthlete
      .getAthleteDetailAllAthleteDetailAllGet({
        year: environment.year,
        affiliate_id: environment.affiliateId,
      })
      .subscribe({
        next: (data: apiAthleteDetail[]) => {
          this.allAthletes.set(data);
          athleteDataLoaded = true;
          this.dataLoaded =
            appreciationDataLoaded &&
            appreciationStatusDataLoaded &&
            athleteDataLoaded;
        },
        error: (err: any) => {
          this.toastService.showToast(
            'Failed to load athlete data',
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

  async editAppreciation(appreciation: apiAppreciationModel) {
    const modal = await this.modalController.create({
      component: EditAppreciationComponent,
      componentProps: {
        appreciation: appreciation,
        allAthletes: this.allAthletes(),
        teamAthletes: this.teamAthletes(),
        nonTeamAthletes: this.nonTeamAthletes(),
      },
      breakpoints: [0.5, 0.75],
      initialBreakpoint: 0.75,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log(data);
    }
  }

  cancelEdit() {}

  addNewAppreciation() {}

  resetForm() {}

  saveAppreciation() {}

  getAthleteName(crossfitId: number): string {
    const athlete = this.allAthletes().find(
      (a) => a.crossfit_id === crossfitId
    );
    return athlete?.name || `Athlete ${crossfitId}`;
  }
}
