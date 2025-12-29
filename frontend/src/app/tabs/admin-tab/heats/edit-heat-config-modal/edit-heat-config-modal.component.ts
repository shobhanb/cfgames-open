import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  ModalController,
} from '@ionic/angular/standalone';
import { apiHeatsSetupModel } from 'src/app/api/models';

@Component({
  selector: 'app-edit-heat-config-modal',
  templateUrl: './edit-heat-config-modal.component.html',
  styleUrls: ['./edit-heat-config-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
  ],
})
export class EditHeatConfigModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  config!: apiHeatsSetupModel;
  configForm!: FormGroup;

  ngOnInit() {
    if (!this.config) return;

    this.configForm = this.fb.group({
      startTime: [this.config.start_time.substring(0, 5), Validators.required],
      endTime: [this.config.end_time.substring(0, 5), Validators.required],
      interval: [
        this.config.interval,
        [Validators.required, Validators.min(5), Validators.max(120)],
      ],
      maxAthletes: [
        this.config.max_athletes || 10,
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
    });
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (this.configForm.valid) {
      this.modalController.dismiss(this.configForm.value, 'confirm');
    }
  }
}
