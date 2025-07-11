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
  AlertController,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../../shared/auth-state/auth-state.component';
import { ThemeComponent } from '../../../shared/theme/theme.component';
import { apiAthleteService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { apiAthleteDetail } from 'src/app/api/models';
import { addIcons } from 'ionicons';
import { diamondOutline, ribbonOutline } from 'ionicons/icons';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-teams',
  templateUrl: './edit-teams.page.html',
  styleUrls: ['./edit-teams.page.scss'],
  standalone: true,
  imports: [
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
    CommonModule,
    FormsModule,
    AuthStateComponent,
    ThemeComponent,
  ],
})
export class EditTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);

  private athleteData = signal<apiAthleteDetail[]>([]);

  filteredAthleteData = computed<apiAthleteDetail[]>(() => {
    const search = this.searchText();
    const athletes = this.athleteData();
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

  dataLoaded = false;
  searchText = signal<string | null>(null);

  constructor() {
    addIcons({ diamondOutline, ribbonOutline });
  }

  ngOnInit() {
    this.getData();
  }

  private getData() {
    this.apiAthlete
      .getAthleteDetailAllAthleteDetailAllGet({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (data: apiAthleteDetail[]) => {
          this.athleteData.set(
            data.sort((a: apiAthleteDetail, b: apiAthleteDetail) =>
              a.name > b.name ? 1 : -1
            )
          );
          this.dataLoaded = true;
        },
        error: (err: any) => {
          console.error(err.message);
        },
      });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
  }

  async onClickCoach(athlete: apiAthleteDetail) {
    await this.apiAthlete
      .assignAthleteToTeamAthleteTeamAssignPut({
        crossfit_id: athlete.crossfit_id,
        year: athlete.year,
        team_name: athlete.team_name,
        team_role: athlete.team_role === 1 ? 0 : 1,
      })
      .subscribe({
        next: (data: apiAthleteDetail) => {
          this.athleteData.update((athletes) =>
            athletes.map((a) =>
              a.crossfit_id === data.crossfit_id && a.year === data.year
                ? { ...a, team_role: data.team_role }
                : a
            )
          );
          this.toastService.showToast(
            `Assigned ${data.name} as coach of team ${data.team_name}`,
            'success',
            null,
            1000
          );
          const item = document.getElementById(
            `sliding-team-${athlete.crossfit_id}`
          );
          if (item) {
            const slidingItem = item as HTMLIonItemSlidingElement;
            slidingItem.close();
          }
        },
        error: (err: any) => {
          this.toastService.showToast(err.message, 'danger', null, 3000);
        },
      });
  }

  async onClickTeamLeader(athlete: apiAthleteDetail) {
    await this.apiAthlete
      .assignAthleteToTeamAthleteTeamAssignPut({
        crossfit_id: athlete.crossfit_id,
        year: athlete.year,
        team_name: athlete.team_name,
        team_role: athlete.team_role === 2 ? 0 : 2,
      })
      .subscribe({
        next: (data: apiAthleteDetail) => {
          this.athleteData.update((athletes) =>
            athletes.map((a) =>
              a.crossfit_id === data.crossfit_id && a.year === data.year
                ? { ...a, team_role: data.team_role }
                : a
            )
          );
          this.toastService.showToast(
            `Assigned ${data.name} as Team Leader of team ${data.team_name}`,
            'success',
            null,
            1000
          );
          const item = document.getElementById(
            `sliding-team-${athlete.crossfit_id}`
          );
          if (item) {
            const slidingItem = item as HTMLIonItemSlidingElement;
            slidingItem.close();
          }
        },
        error: (err: any) => {
          this.toastService.showToast(err.message, 'danger', null, 3000);
        },
      });
  }

  async onClickEditTeam(athlete: apiAthleteDetail) {
    const alert = await this.alertController.create({
      header: 'Edit Team',
      inputs: [
        {
          name: 'team_name',
          type: 'text',
          value: athlete.team_name,
          placeholder: 'Team Name',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            this.apiAthlete
              .assignAthleteToTeamAthleteTeamAssignPut({
                crossfit_id: athlete.crossfit_id,
                year: athlete.year,
                team_name: data.team_name,
                team_role: athlete.team_role,
              })
              .subscribe({
                next: (updatedAthlete) => {
                  this.athleteData.update((athletes) =>
                    athletes.map((a) =>
                      a.crossfit_id === updatedAthlete.crossfit_id &&
                      a.year === updatedAthlete.year
                        ? { ...a, team_name: updatedAthlete.team_name }
                        : a
                    )
                  );
                  this.toastService.showToast(
                    `Updated team name to ${updatedAthlete.team_name}`,
                    'success',
                    null,
                    1000
                  );
                },
                error: (err) => {
                  this.toastService.showToast(
                    err.message,
                    'danger',
                    null,
                    3000
                  );
                },
              });
          },
        },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result) {
      const item = document.getElementById(
        `sliding-team-${athlete.crossfit_id}`
      );
      if (item) {
        const slidingItem = item as HTMLIonItemSlidingElement;
        slidingItem.close();
      }
    }
  }
}
