import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  computed,
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
  IonText,
  IonLabel,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationResultNotes } from 'src/app/api/models';
import { AthleteDataService } from 'src/app/services/athlete-data.service';
import { EventService } from 'src/app/services/event.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-my-appreciation-text',
  templateUrl: './my-appreciation-text.page.html',
  styleUrls: ['./my-appreciation-text.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonLabel,
    IonText,
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
  private config = inject(AppConfigService);

  currentYear = this.config.year;
  appreciationResults = signal<apiAppreciationResultNotes[]>([]);
  dataLoaded = signal(false);

  // Group appreciation results by ordinal
  groupedResults = computed(() => {
    const results = this.appreciationResults();
    const grouped = new Map<
      number,
      { ordinal: number; year: number; texts: string[] }
    >();

    results.forEach((result) => {
      if (!grouped.has(result.ordinal)) {
        grouped.set(result.ordinal, {
          ordinal: result.ordinal,
          year: result.year,
          texts: [],
        });
      }
      grouped.get(result.ordinal)!.texts.push(result.text);
    });

    // Convert to array and sort by ordinal
    return Array.from(grouped.values()).sort((a, b) => a.ordinal - b.ordinal);
  });

  ngOnInit() {
    this.loadAppreciationText();
  }

  loadAppreciationText() {
    this.dataLoaded.set(false);
    this.apiAppreciation
      .getMyAppreciationTextAppreciationMyAppreciationTextGet({
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          // Sort by ordinal
          const sorted = [...data].sort((a, b) => a.ordinal - b.ordinal);
          this.appreciationResults.set(sorted);
          this.dataLoaded.set(true);
        },
        error: (error) => {
          console.error(
            'Error loading appreciation text:',
            error.error?.detail
          );
          this.dataLoaded.set(true);
        },
      });
  }

  handleRefresh(event: any) {
    this.loadAppreciationText();
    (event.target as HTMLIonRefresherElement).complete();
  }
}
