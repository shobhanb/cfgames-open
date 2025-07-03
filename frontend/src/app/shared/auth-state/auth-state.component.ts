import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth-state',
  templateUrl: './auth-state.component.html',
  styleUrls: ['./auth-state.component.scss'],
  imports: [
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

  constructor() {}

  ngOnInit() {}

  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  onClickResendVerificationEmail() {
    this.authService.sendVerificationEmail();
  }

  onClickRefresh() {
    this.authService.refreshTokenAfterVerification();
  }

  onClickSignOut() {
    this.authService.logout();
  }

  onClickCancel() {
    this.isModalOpen = false;
  }
}
