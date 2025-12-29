import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSkeletonText,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationResultNotes } from 'src/app/api/models';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-my-appreciation-text',
  templateUrl: './my-appreciation-text.page.html',
  styleUrls: ['./my-appreciation-text.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonItem,
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSkeletonText,
    IonButtons,
    IonBackButton,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class MyAppreciationTextPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);
  athleteDataService = inject(AthleteDataService);
  eventService = inject(EventService);

  appreciationResults = signal<apiAppreciationResultNotes[]>([]);
  dataLoaded = signal(false);
  currentYear = 2025;

  ngOnInit() {
    this.loadAppreciationText();
  }

  loadAppreciationText() {
    this.dataLoaded.set(false);
    this.apiAppreciation
      .getMyAppreciationTextAppreciationMyAppreciationTextGet({
        year: this.currentYear,
      })
      .subscribe({
        next: (data) => {
          // Sort by ordinal
          const sorted = [...data].sort((a, b) => a.ordinal - b.ordinal);
          this.appreciationResults.set(sorted);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading appreciation text:', error);
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: any) {
    this.loadAppreciationText();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
