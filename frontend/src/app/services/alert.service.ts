import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';

export interface AlertResult {
  role?: 'confirm' | 'cancel';
  inputValue?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertController = inject(AlertController);

  async showAlert(
    header: string,
    options?: {
      inputLabel?: string;
    }
  ): Promise<AlertResult> {
    const alertButtons = [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'OK',
        role: 'confirm',
      },
    ];

    const alertOptions: any = {
      header,
      buttons: alertButtons,
    };

    if (options?.inputLabel) {
      alertOptions.inputs = [
        {
          type: 'text',
          name: 'inputValue',
          value: options.inputLabel,
        },
      ];
    }

    const alert = await this.alertController.create(alertOptions);

    await alert.present();
    const result = await alert.onDidDismiss();

    return {
      role: result.role as 'confirm' | 'cancel',
      inputValue: result.data?.values?.inputValue,
    };
  }
}
