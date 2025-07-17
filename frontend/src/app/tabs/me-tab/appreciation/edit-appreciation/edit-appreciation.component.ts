import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { apiAppreciationModel, apiAthleteDetail } from 'src/app/api/models';
import {
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonIcon,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonList,
  ModalController,
  IonText,
  IonLabel,
  IonInput,
  IonNavLink,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/services/event.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-appreciation',
  templateUrl: './edit-appreciation.component.html',
  styleUrls: ['./edit-appreciation.component.scss'],
  imports: [
    IonNavLink,
    IonInput,
    IonLabel,
    IonText,
    IonList,
    IonSearchbar,
    IonContent,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonButton,
    IonIcon,
    IonItem,
    IonAccordion,
    IonAccordionGroup,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
  ],
})
export class EditAppreciationComponent implements OnInit {
  private authService = inject(AuthService);
  private modalController = inject(ModalController);
  eventService = inject(EventService);

  @Input({ required: true }) appreciation!: apiAppreciationModel;
  @Input({ required: true }) allAthletes!: apiAthleteDetail[];
  @Input({ required: true }) teamAthletes!: apiAthleteDetail[];
  @Input({ required: true }) nonTeamAthletes!: apiAthleteDetail[];

  constructor() {}

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

  getAthleteName(crossfitId: number): string {
    const athlete = this.allAthletes.find((a) => a.crossfit_id === crossfitId);
    return athlete?.name || `Athlete ${crossfitId}`;
  }
}
