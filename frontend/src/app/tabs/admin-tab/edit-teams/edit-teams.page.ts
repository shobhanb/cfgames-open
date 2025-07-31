import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonLabel,
  IonIcon,
  IonSkeletonText,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonNote,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { apiAthleteService } from 'src/app/api/services';
import { apiAthleteDetail } from 'src/app/api/models';
import { addIcons } from 'ionicons';
import {
  diamondOutline,
  ribbonOutline,
  ellipsisHorizontalOutline,
  bodyOutline,
} from 'ionicons/icons';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AlertService } from 'src/app/services/alert.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { EditAthleteComponent } from './edit-athlete/edit-athlete.component';

@Component({
  selector: 'app-teams',
  templateUrl: './edit-teams.page.html',
  styleUrls: ['./edit-teams.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonNote,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonSkeletonText,
    IonIcon,
    IonLabel,
    IonRefresherContent,
    IonRefresher,
    IonItem,
    IonList,
    IonSearchbar,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    ToolbarButtonsComponent,
  ],
})
export class EditTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private athleteDataService = inject(AthleteDataService);
  private modalController = inject(ModalController);

  filteredAthleteData = computed<apiAthleteDetail[]>(() => {
    const search = this.searchText();
    const athletes = this.athleteDataService.athleteData();
    if (search) {
      return athletes.filter(
        (value: apiAthleteDetail) =>
          value.name.toLowerCase().includes(search) ||
          value.team_name.toLowerCase().includes(search)
      );
    } else {
      return athletes;
    }
  });

  get loading() {
    return this.athleteDataService.loading();
  }

  searchText = signal<string | null>(null);

  constructor() {
    addIcons({
      diamondOutline,
      ribbonOutline,
      bodyOutline,
      ellipsisHorizontalOutline,
    });
  }

  ngOnInit() {
    this.athleteDataService.getData().catch((error) => {
      this.toastService.showToast(
        'Failed to load athlete data',
        'danger',
        null,
        3000
      );
    });
  }

  handleRefresh(event: CustomEvent) {
    this.athleteDataService.getData().finally(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  async onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
  }

  async onClickAthlete(athlete: apiAthleteDetail) {
    const modal = await this.modalController.create({
      component: EditAthleteComponent,
      componentProps: {
        athlete,
      },
      initialBreakpoint: 0.75,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.athleteDataService.athleteData.update(
        (athletes: apiAthleteDetail[]) =>
          athletes.map((a: apiAthleteDetail) =>
            a.crossfit_id === data.crossfit_id && a.year === data.year
              ? { ...a, ...data }
              : a
          )
      );
      this.toastService.showToast(
        `Updated athlete ${data.name}`,
        'success',
        null,
        1000
      );
    }
  }
}
