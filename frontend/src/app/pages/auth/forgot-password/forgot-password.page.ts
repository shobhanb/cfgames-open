import { Component, inject, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
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
  IonItem,
  IonList,
} from '@ionic/angular/standalone';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonButton,
    IonInput,
    IonContent,
    ReactiveFormsModule,
  ],
})
export class ForgotPasswordPage implements OnInit {
  private toastService = inject(ToastService);
  private fireAuth = inject(Auth);

  emailForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
  });

  async onClickSubmit() {
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

  constructor() {}

  ngOnInit() {}
}
