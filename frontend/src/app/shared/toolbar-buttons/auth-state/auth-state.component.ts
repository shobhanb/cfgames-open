import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButtons,
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
  IonRouterLink,
  IonNote,
  IonTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';
import { TeamNamePipe } from 'src/app/pipes/team-name.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-auth-state',
  templateUrl: './auth-state.component.html',
  styleUrls: ['./auth-state.component.scss'],
  imports: [
    IonTitle,
    IonNote,
    IonIcon,
    IonListHeader,
    IonToolbar,
    IonHeader,
    IonModal,
    IonList,
    IonButton,
    IonButtons,
    IonLabel,
    IonItem,
    IonContent,
    TeamNamePipe,
    RouterLink,
    IonRouterLink,
  ],
})
export class AuthStateComponent implements OnInit {
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  @ViewChild(IonModal) modal!: IonModal;

  constructor() {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {}

  isModalOpen: boolean = false;

  openModal() {
    this.authService.forceRefreshToken();
    this.isModalOpen = true;
  }

  async onClickResendVerificationEmail() {
    await this.authService.sendVerificationEmail();
  }

  async onClickRefresh() {
    await this.authService.forceRefreshToken();
  }

  async onClickSignOut() {
    await this.authService.logout();
    this.isModalOpen = false;
  }

  onClickCancel() {
    this.isModalOpen = false;
  }
}
