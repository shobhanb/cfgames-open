import {
  Component,
  inject,
  Input,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
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
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSkeletonText,
  IonText,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationResultDetail } from 'src/app/api/models';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';
import { EventService } from 'src/app/services/event.service';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-appreciation-detail',
  templateUrl: './appreciation-detail.page.html',
  styleUrls: ['./appreciation-detail.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonSkeletonText,
    IonNote,
    IonLabel,
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
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class AppreciationDetailPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);
  private toastService = inject(ToastService);
  eventService = inject(EventService);
  athleteDataService = inject(AthleteDataService);

  appreciationDetail = signal<apiAppreciationResultDetail | null>(null);

  dataLoaded = false;

  @Input({ required: true, transform: numberAttribute }) year!: number;
  @Input({ required: true, transform: numberAttribute }) ordinal!: number;
  @Input({ required: true, transform: numberAttribute }) crossfitId!: number;

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiAppreciation
      .getAppreciationResultsDetailAppreciationDetailGet({
        affiliate_id: environment.affiliateId,
        year: this.year,
        ordinal: this.ordinal,
        crossfit_id: this.crossfitId,
      })
      .subscribe({
        next: (data) => {
          this.appreciationDetail.set(data);
          this.dataLoaded = true;
        },
        error: (error) => {
          console.error('Error fetching appreciation detail:', error);
          this.toastService.showToast(
            'Error fetching appreciation detail. Please try again later.',
            'danger',
            null,
            2000
          );
        },
      });
  }
}
