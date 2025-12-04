import { Component, inject, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
} from '@ionic/angular/standalone';
import { AppConfigService } from 'src/app/services/app-config.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonList,
    IonItem,
    IonButton,
    IonInput,
    IonContent,
    ReactiveFormsModule,
    ToolbarButtonsComponent,
  ],
})
export class ForgotPasswordPage implements OnInit {
  private toastService = inject(ToastService);
  private fireAuth = inject(Auth);
  private router = inject(Router);
  config = inject(AppConfigService);

  emailForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  async onSubmit() {
    if (this.emailForm.valid && this.emailForm.dirty) {
      sendPasswordResetEmail(this.fireAuth, this.emailForm.value.email!)
        .then(() => {
          this.toastService.showToast(
            `Password reset link sent to ${this.emailForm.value.email}`,
            'success',
            '/',
            3000
          );
        })
        .catch((err: FirebaseError) => {
          console.error(err);
          this.toastService.showToast(err.message, 'danger', '/', 3000);
        });
    }
  }

  onCancel() {
    this.emailForm.reset();
    this.router.navigate(['/']);
  }

  constructor() {}

  ngOnInit() {}
}
