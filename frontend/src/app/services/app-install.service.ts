import { inject, Injectable, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { InstallAppModalComponent } from '../shared/install-app-modal/install-app-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AppInstallService {
  private modalController = inject(ModalController);
  private readonly STORAGE_KEY = 'cf-games-install-prompt-hidden';

  readonly showInstallButton = signal(true);

  constructor() {
    this.checkStoredPreference();
  }

  private checkStoredPreference(): void {
    const storedPreference = localStorage.getItem(this.STORAGE_KEY);
    if (storedPreference === 'true') {
      this.showInstallButton.set(false);
    }
  }

  public dontShowAgain() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.showInstallButton.set(false);
  }

  async showInstallModal() {
    const modal = await this.modalController.create({
      component: InstallAppModalComponent,
      breakpoints: [0.5, 0.8],
      initialBreakpoint: 0.8,
    });

    await modal.present();
  }
}
