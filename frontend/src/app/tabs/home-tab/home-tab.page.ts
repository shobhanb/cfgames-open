import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonIcon,
  ModalController,
  IonText,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import {
  apiAthleteService,
  apiCfgamesService,
  apiHomeBlogService,
} from 'src/app/api/services';
import { apiAthleteSummaryCounts, apiHomeBlogModel } from 'src/app/api/models';
import { RouterLink } from '@angular/router';
import { AppInstallService } from 'src/app/services/app-install.service';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { LearnComponent } from './learn/learn.component';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.page.html',
  styleUrls: ['./home-tab.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonButton,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    RouterLink,
    IonRouterLink,
    IonText,
  ],
})
export class HomeTabPage implements OnInit {
  private apiHomeBlog = inject(apiHomeBlogService);
  private config = inject(AppConfigService);
  private modalController = inject(ModalController);
  private apiAthlete = inject(apiAthleteService);
  private cfGamesData = inject(apiCfgamesService);

  authService = inject(AuthService);
  appInstallService = inject(AppInstallService);

  blogData = signal<apiHomeBlogModel[]>([]);

  athleteCountsData = signal<apiAthleteSummaryCounts[] | null>(null);

  cfGamesDataTimestamp = signal<Date | null>(null);

  welcomeMessage = `Welcome to ${this.config.affiliateName}'s Community Cup for the CF Open.`;

  constructor() {
    addIcons({ closeOutline });
  }

  dataLoaded = signal<boolean>(false);

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiHomeBlog
      .getHomeBlogHomeBlogGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          this.blogData.set(
            data.sort(
              (a: apiHomeBlogModel, b: apiHomeBlogModel) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
          );
          this.dataLoaded.set(true);
        },
      });

    this.apiAthlete
      .getCountsSummaryAthleteSummaryGet({
        affiliate_id: this.config.affiliateId,
      })
      .subscribe({
        next: (data: apiAthleteSummaryCounts[]) => {
          this.athleteCountsData.set(data);
        },
        error: (error) => {
          console.error('Error fetching athlete summary counts:', error);
          this.athleteCountsData.set(null);
        },
      });

    this.cfGamesData
      .getCfGamesDataEndpointCfgamesDataAffiliateIdYearGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            console.log(data[0].timestamp);
            const utcDate = new Date(data[0].timestamp + '+0000');
            this.cfGamesDataTimestamp.set(utcDate);
          }
        },
        error: (error) => {
          console.error('Error fetching CF Games data timestamp:', error);
          this.cfGamesDataTimestamp.set(null);
        },
      });
  }

  async onClickLearnMore() {
    const modal = await this.modalController.create({
      component: LearnComponent,
    });

    await modal.present();
  }
}
