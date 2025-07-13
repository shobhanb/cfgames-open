import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardSubtitle,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { apiAthleteService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';
import { apiAthleteDetail } from 'src/app/api/models';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCardSubtitle,
    IonCard,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class MyTeamPage implements OnInit {
  authService = inject(AuthService);
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);

  constructor() {}

  dataLoaded = false;

  athletes = signal<apiAthleteDetail[]>([]);

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private async getData() {
    await this.apiAthlete
      .getAthleteDetailAllAthleteDetailAllGet({
        affiliate_id: environment.affiliateId,
        year: environment.year,
        team_name: this.authService.athlete()?.team_name,
      })
      .subscribe({
        next: (data: apiAthleteDetail[]) => {
          this.athletes.set(data);
          this.dataLoaded = true;
        },
        error: (err: any) => {
          this.toastService.showToast(err.message, 'danger', null, 3000);
        },
      });
  }
}
