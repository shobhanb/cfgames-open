import { inject, Injectable, signal, linkedSignal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { InstallAppModalComponent } from '../shared/install-app-modal/install-app-modal.component';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AppInstallService {
  private modalController = inject(ModalController);
  private platform = inject(Platform);
  private readonly STORAGE_KEY = 'cf-games-install-prompt-hidden';

  readonly showInstallButton = signal(true);
  readonly platformType = linkedSignal(() => {
    if (this.platform.is('ios')) {
      return 'ios' as const;
    } else if (this.platform.is('android')) {
      return 'android' as const;
    } else if (this.platform.is('pwa')) {
      return 'pwa' as const;
    } else {
      return 'web' as const;
    }
  });

  constructor() {
    if (this.platformType() === 'pwa' || this.platformType() === 'web') {
      this.showInstallButton.set(false);
    } else {
      this.checkStoredPreference();
    }
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
