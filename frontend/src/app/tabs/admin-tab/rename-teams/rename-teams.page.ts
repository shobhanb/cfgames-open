import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonList,
  IonItemOption,
  IonItem,
  IonLabel,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonSkeletonText,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { ThemeComponent } from 'src/app/shared/theme/theme.component';
import { AuthStateComponent } from 'src/app/shared/auth-state/auth-state.component';
import { apiAthleteService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { apiTeamName } from 'src/app/api/models';

@Component({
  selector: 'app-rename-teams',
  templateUrl: './rename-teams.page.html',
  styleUrls: ['./rename-teams.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonInput,
    IonSkeletonText,
    IonItemOptions,
    IonItemSliding,
    IonIcon,
    IonLabel,
    IonItem,
    IonItemOption,
    IonList,
    IonSearchbar,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    ThemeComponent,
    AuthStateComponent,
  ],
})
export class RenameTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  dataLoaded = false;
  teamNames = signal<string[]>([]);

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private getData() {
    this.apiAthlete
      .getTeamNamesAthleteTeamNamesGet({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (data: apiTeamName[]) => {
          this.teamNames.set(data.map((team) => team.team_name).sort());
          this.dataLoaded = true;
        },
        error: (err: any) => {
          this.toastService.showToast(err.message, 'danger', null, 3000);
        },
      });
  }

  onClickRenameTeam(teamName: string) {
    const newTeamName = prompt('Enter new team name:', teamName);
    if (newTeamName && newTeamName.trim() !== '') {
      this.apiAthlete
        .renameTeamsAthleteRenameTeamsPut({
          affiliate_id: environment.affiliateId,
          year: environment.year,
          old_team_name: teamName,
          new_team_name: newTeamName.trim(),
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Team renamed successfully',
              'success',
              null,
              2000
            );
            this.getData();
          },
          error: (err: any) => {
            this.toastService.showToast(err.message, 'danger', null, 3000);
          },
        });
    }
  }
}
