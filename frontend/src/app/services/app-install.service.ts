import { inject, Injectable, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { InstallAppModalComponent } from '../shared/install-app-modal/install-app-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AppInstallService {
  private readonly STORAGE_KEY = 'cf-games-install-prompt-hidden';
  showInstallButton = signal(true);

  private modalController = inject(ModalController);

  constructor() {
    this.checkStoredPreference();
  }

  private checkStoredPreference(): void {
    const storedPreference = localStorage.getItem(this.STORAGE_KEY);
    if (storedPreference === 'true') {
      this.showInstallButton.set(false);
    }
  }

  private savePreference(dontShowAgain: boolean): void {
    if (dontShowAgain) {
      localStorage.setItem(this.STORAGE_KEY, 'true');
      this.showInstallButton.set(false);
    }
  }

  async showInstallModal() {
    const modal = await this.modalController.create({
      component: InstallAppModalComponent,
      breakpoints: [0.5, 0.75],
      initialBreakpoint: 0.75,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.dontShowAgain) {
      this.savePreference(true);
    }
  }
}
