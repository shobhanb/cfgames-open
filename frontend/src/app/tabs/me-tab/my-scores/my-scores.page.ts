import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSkeletonText,
  IonIcon,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { ToastService } from 'src/app/services/toast.service';
import { apiScoreService } from 'src/app/api/services';
import { AuthService } from 'src/app/services/auth.service';
import { apiUserScoreModel } from 'src/app/api/models';
import { EventService } from 'src/app/services/event.service';
import { TeamNamePipe } from '../../../pipes/team-name.pipe';
import { addIcons } from 'ionicons';
import { openOutline } from 'ionicons/icons';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-my-scores',
  templateUrl: './my-scores.page.html',
  styleUrls: ['./my-scores.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    IonIcon,
    IonSkeletonText,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonButton,
    IonRefresherContent,
    IonRefresher,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TeamNamePipe,
    ToolbarButtonsComponent,
  ],
})
export class MyScoresPage implements OnInit {
  private toastService = inject(ToastService);
  private apiScore = inject(apiScoreService);
  authService = inject(AuthService);
  eventService = inject(EventService);

  dataLoaded = false;

  private scores = signal<apiUserScoreModel[]>([]);

  readonly groupedScores = computed(() => {
    const scores = this.scores();
    const groups: { [year: number]: apiUserScoreModel[] } = {};
    scores.forEach((score) => {
      if (!groups[score.year]) {
        groups[score.year] = [];
      }
      groups[score.year].push(score);
    });
    return Object.entries(groups)
      .map(([year, scores]) => ({
        year: +year,
        scores: scores.sort((a, b) => a.ordinal - b.ordinal),
      }))
      .sort((a, b) => b.year - a.year);
  });

  private getData() {
    this.apiScore.getMyScoresScoreMeGet().subscribe({
      next: (data: apiUserScoreModel[]) => {
        this.scores.set(data);
        this.dataLoaded = true;
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.showToast(err.message, 'danger', null, 3000);
      },
    });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  constructor() {
    addIcons({ openOutline });
  }

  ngOnInit() {
    this.getData();
  }
}
