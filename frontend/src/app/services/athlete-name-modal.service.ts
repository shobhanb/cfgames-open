import { Injectable, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { AthleteNameModalComponent } from '../shared/athlete-name-modal/athlete-name-modal.component';
import { Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AthleteNameModalService {
  private modalController = inject(ModalController);

  /**
   * Opens an athlete selection modal and returns the selected athlete name
   *
   * @param athleteNames A signal containing an array of athlete names to display
   * @returns Promise with the selected athlete name or undefined if dismissed
   */
  async openAthleteSelectModal(
    athleteNames: Signal<string[]>
  ): Promise<string | undefined> {
    const modal = await this.modalController.create({
      component: AthleteNameModalComponent,
      componentProps: { athleteNames },
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    return data;
  }
}
