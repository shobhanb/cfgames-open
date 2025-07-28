import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
  IonSkeletonText,
  IonNote,
} from '@ionic/angular/standalone';
import { apiAthleteService } from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';
import { apiTeamName } from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AlertService } from 'src/app/services/alert.service';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-rename-teams',
  templateUrl: './rename-teams.page.html',
  styleUrls: ['./rename-teams.page.scss'],
  standalone: true,
  imports: [
    IonNote,
    IonSkeletonText,
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
    ReactiveFormsModule,
    ToolbarButtonsComponent,
  ],
})
export class RenameTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private config = inject(AppConfigService);

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
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
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

  async onClickRenameTeam(teamName: string) {
    const result = await this.alertService.showAlert('Rename Team', {
      inputLabel: teamName,
    });

    if (result.role === 'confirm' && result.inputValue) {
      const newTeamName = result.inputValue;

      this.apiAthlete
        .renameTeamsAthleteRenameTeamsPut({
          affiliate_id: this.config.affiliateId,
          year: this.config.year,
          old_team_name: teamName,
          new_team_name: newTeamName,
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
