import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonLabel,
  IonNote,
  IonItem,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  syncOutline,
  settingsOutline,
  archiveOutline,
  heartOutline,
  calendarOutline,
} from 'ionicons/icons';
import { apiAffiliateConfigService } from 'src/app/api/services';
import { AppConfigService } from 'src/app/services/app-config.service';
import { apiAffiliateConfigModel } from 'src/app/api/models';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonNote,
    IonLabel,
    IonContent,
    IonIcon,
    IonButton,
    IonButtons,
    IonTitle,
    IonHeader,
    IonToolbar,
  ],
})
export class LearnComponent implements OnInit {
  private modalController = inject(ModalController);
  private apiAffiliateConfig = inject(apiAffiliateConfigService);
  config = inject(AppConfigService);

  affiliateConfig = signal<apiAffiliateConfigModel | null>(null);

  constructor() {
    addIcons({
      closeOutline,
      syncOutline,
      settingsOutline,
      archiveOutline,
      heartOutline,
      calendarOutline,
    });
  }

  ngOnInit() {
    this.apiAffiliateConfig
      .getAffiliateConfigAffiliateConfigAffiliateIdYearGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          this.affiliateConfig.set(data);
        },
        error: (error) => {
          console.error('Error fetching affiliate config:', error);
        },
      });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
