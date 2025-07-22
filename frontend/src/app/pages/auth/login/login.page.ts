import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonList,
  IonRouterLink,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { FirebaseError } from '@angular/fire/app';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonToolbar,
    IonHeader,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonContent,
    IonInputPasswordToggle,
    CommonModule,
    ReactiveFormsModule,
    IonRouterLink,
    RouterLink,
    ToolbarButtonsComponent,
  ],
})
export class LoginPage implements OnInit {
  private fireAuth = inject(Auth);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  constructor() {}

  ngOnInit() {}

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  onClickLogin() {
    if (
      this.loginForm.valid &&
      this.loginForm.dirty &&
      this.loginForm.value.email &&
      this.loginForm.value.password
    ) {
      this.loadingService.showLoading('Logging in');

      signInWithEmailAndPassword(
        this.fireAuth,
        this.loginForm.value.email,
        this.loginForm.value.password
      )
        .then((value: UserCredential) => {
          if (value.user.emailVerified) {
            this.loadingService.showLoading('Getting athlete info');
            this.authService
              .getMyAthleteInfo()
              .then(() => {
                this.loadingService.dismissLoading();
                this.toastService.showToast(
                  `Logged in as ${value.user.displayName}`,
                  'success',
                  '/',
                  1000
                );
              })
              .catch((err) => {
                this.loadingService.dismissLoading();
                this.toastService.showToast(
                  `Error loading athlete info: ${err.message}`,
                  'danger',
                  '/',
                  3000
                );
              });
          } else {
            this.loadingService.dismissLoading();
            this.toastService.showToast(
              'Logged in. Please verify your email',
              'warning',
              '/',
              5000
            );
          }
        })
        .catch((err: FirebaseError) => {
          console.error(err);
          this.loadingService.dismissLoading();
          this.toastService.showToast(
            `Error logging in: ${err.message}`,
            'danger',
            '/',
            3000
          );
        });
    }
  }
}
