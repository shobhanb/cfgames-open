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
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { ToastService } from 'src/app/services/toast.service';
import { apiAthleteService } from 'src/app/api/services';

@Component({
  selector: 'app-auto-assign-teams',
  templateUrl: './auto-assign-teams.page.html',
  styleUrls: ['./auto-assign-teams.page.scss'],
  standalone: true,
  imports: [
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
export class AutoAssignTeamsPage implements OnInit {
  private apiAthlete = inject(apiAthleteService);
  private toastService = inject(ToastService);

  dataLoaded = signal<boolean>(false);

  constructor() {}

  handleRefresh(event: CustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.dataLoaded.set(false);
  }
}
