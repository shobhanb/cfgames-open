import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertController = inject(AlertController);

  async showAlert(header: string): Promise<'confirm' | 'cancel' | undefined> {
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
    const alert = await this.alertController.create({
      header: header,
      buttons: alertButtons,
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role as 'confirm' | 'cancel' | undefined;
  }
}
