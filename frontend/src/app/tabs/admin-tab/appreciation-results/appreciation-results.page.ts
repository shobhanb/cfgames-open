import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonSkeletonText,
  IonLabel,
  IonRouterLink,
  IonNote,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationCountsModel } from 'src/app/api/models';
import { environment } from 'src/environments/environment';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { ToastService } from 'src/app/services/toast.service';
import { EventService } from 'src/app/services/event.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appreciation-results',
  templateUrl: './appreciation-results.page.html',
  styleUrls: ['./appreciation-results.page.scss'],
  standalone: true,
  imports: [
    IonNote,
    IonLabel,
    IonSkeletonText,
    IonItem,
    IonList,
    IonText,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonRefresherContent,
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
    RouterLink,
    IonRouterLink,
  ],
})
export class AppreciationResultsPage implements OnInit {
  private apiAppreciationService = inject(apiAppreciationService);
  private toastService = inject(ToastService);
  eventService = inject(EventService);

  appreciationCounts = signal<apiAppreciationCountsModel[]>([]);

  constructor() {}

  dataLoaded = false;

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiAppreciationService
      .getAppreciationCountsAppreciationCountsGet({
        affiliate_id: environment.affiliateId,
        year: environment.year,
      })
      .subscribe({
        next: (data: apiAppreciationCountsModel[]) => {
          this.appreciationCounts.set(data);
          this.dataLoaded = true;
        },
        error: (error) => {
          this.toastService.showToast(
            'Error fetching appreciation results. Please try again later.',
            'danger'
          );
          console.error('Error fetching appreciation results:', error);
        },
      });
  }
}
