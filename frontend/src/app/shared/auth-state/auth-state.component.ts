import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  IonButtons,
  IonChip,
  IonLabel,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonModal,
  IonHeader,
  IonToolbar,
  IonListHeader,
  IonIcon,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth-state',
  templateUrl: './auth-state.component.html',
  styleUrls: ['./auth-state.component.scss'],
  imports: [
    IonNote,
    IonIcon,
    IonListHeader,
    IonToolbar,
    IonHeader,
    IonModal,
    IonList,
    IonButton,
    IonButtons,
    IonChip,
    IonLabel,
    IonItem,
    IonContent,
    TeamNamePipe,
  ],
})
export class AuthStateComponent implements OnInit {
  authService = inject(AuthService);

  @ViewChild(IonModal) modal!: IonModal;

  constructor() {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {}

  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  async onClickResendVerificationEmail() {
    await this.authService.sendVerificationEmail();
  }

  async onClickRefreshVerification() {
    await this.authService.refreshTokenAfterVerification();
  }

  async onClickRefreshAthlete() {
    await this.authService.refreshTokenAfterVerification();
    await this.authService.getMyAthleteInfo();
  }

  async onClickSignOut() {
    await this.authService.logout();
  }

  onClickCancel() {
    this.isModalOpen = false;
  }
}
