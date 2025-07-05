import { inject, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingController = inject(LoadingController);
  private loading?: HTMLIonLoadingElement;

  async showLoading(message: string): Promise<void> {
    if (this.loading) {
      // If already showing, update the message
      this.loading.message = message;
      return;
    }
    this.loading = await this.loadingController.create({
      message: message,
    });
    await this.loading.present();
  }

  async dismissLoading(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }

  constructor() {}
}
