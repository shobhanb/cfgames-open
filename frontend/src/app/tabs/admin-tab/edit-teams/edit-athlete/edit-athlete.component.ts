import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormControl,
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
  ModalController,
  IonRadioGroup,
  IonItem,
  IonRadio,
  IonInput,
} from '@ionic/angular/standalone';
import { apiAthleteDetail } from 'src/app/api/models';
import { apiAthleteService } from 'src/app/api/services';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-athlete',
  templateUrl: './edit-athlete.component.html',
  styleUrls: ['./edit-athlete.component.scss'],
  imports: [
    IonInput,
    IonRadio,
    IonItem,
    IonRadioGroup,
    IonList,
    IonContent,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    ReactiveFormsModule,
  ],
})
export class EditAthleteComponent implements OnInit {
  private modalController = inject(ModalController);
  private toastService = inject(ToastService);
  private apiAthlete = inject(apiAthleteService);

  @Input({ required: true }) athlete: apiAthleteDetail | null = null;

  form = new FormGroup({
    athleteType: new FormControl(0, { validators: [Validators.required] }),
    teamName: new FormControl('', { validators: [Validators.required] }),
  });

  close() {
    this.modalController.dismiss();
  }

  constructor() {}

  ngOnInit() {
    this.form.patchValue({
      athleteType: this.athlete?.team_role || 0,
      teamName: this.athlete?.team_name || '',
    });
  }

  formValid() {
    return this.form.dirty && this.form.valid;
  }

  onSubmit() {
    if (!this.formValid()) {
      return;
    }
    this.apiAthlete
      .assignAthleteToTeamAthleteTeamAssignPut({
        crossfit_id: this.athlete!.crossfit_id,
        year: this.athlete!.year,
        team_role: this.form.value.athleteType!,
        team_name: this.form.value.teamName!,
      })
      .subscribe({
        next: (data: apiAthleteDetail) => {
          this.toastService.showToast(
            'Athlete edited successfully',
            'success',
            null,
            3000
          );
          this.form.reset();
          this.modalController.dismiss(data);
        },
        error: (err) => {
          this.toastService.showToast(
            'Failed to assign athlete to team',
            'danger',
            null,
            3000
          );
        },
      });
  }

  onCancel() {
    this.form.reset();
    this.modalController.dismiss();
  }
}
