import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonCardHeader,
  IonRefresherContent,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSkeletonText,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { apiCfgamesService } from 'src/app/api/services';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiCfDataCountModel, apiCfGamesDataModel } from 'src/app/api/models';

@Component({
  selector: 'app-cfdata-refresh',
  templateUrl: './cfdata-refresh.page.html',
  styleUrls: ['./cfdata-refresh.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonText,
    IonSkeletonText,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonRefresherContent,
    IonCardHeader,
    IonRefresher,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    DatePipe,
  ],
})
export class CfdataRefreshPage implements OnInit {
  private apiCFGames = inject(apiCfgamesService);
  private config = inject(AppConfigService);
  private toastService = inject(ToastService);

  dataLoaded = signal<boolean>(false);
  refreshing = signal<boolean>(false);
  refreshData = signal<apiCfDataCountModel | null>(null);
  dataAvailability = signal<apiCfGamesDataModel[]>([]);

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataLoaded.set(false);
    this.apiCFGames
      .getCfGamesDataEndpointCfgamesDataAffiliateIdYearGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data: apiCfGamesDataModel[]) => {
          this.dataAvailability.set(
            data.map((item) => ({
              ...item,
              timestamp: item.timestamp + '+0000',
            }))
          );
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.toastService.showToast(
            'Failed to load data availability',
            'danger'
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  onClickRefreshData() {
    this.refreshing.set(true);
    this.apiCFGames
      .adminRefreshCfGamesDataCfgamesAdminRefreshGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          this.refreshData.set(data);
          this.refreshing.set(false);
          this.toastService.showToast(
            `Successfully refreshed CF Games data! Entrants: ${data.entrant_count}, Scores: ${data.score_count}`,
            'success'
          );
          // Reload the data availability after refresh
          this.loadData();
        },
        error: (error) => {
          console.error('Error refreshing data:', error);
          this.refreshing.set(false);
          this.toastService.showToast(
            'Failed to refresh CF Games data',
            'danger'
          );
        },
      });
  }
}
