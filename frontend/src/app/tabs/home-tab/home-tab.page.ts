import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiHomeBlogService } from 'src/app/api/services';
import { apiHomeBlogModel } from 'src/app/api/models';
import { RouterLink } from '@angular/router';
import { AppInstallService } from 'src/app/services/app-install.service';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { LearnComponent } from './learn/learn.component';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.page.html',
  styleUrls: ['./home-tab.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonButton,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
    RouterLink,
    IonRouterLink,
  ],
})
export class HomeTabPage implements OnInit {
  private apiHomeBlog = inject(apiHomeBlogService);
  private config = inject(AppConfigService);
  private modalController = inject(ModalController);
  authService = inject(AuthService);
  appInstallService = inject(AppInstallService);

  blogData = signal<apiHomeBlogModel[]>([]);

  welcomeMessage = `Welcome to ${this.config.affiliateName}'s Community Cup for the CF Open.`;

  constructor() {
    addIcons({ closeOutline });
  }

  dataLoaded = signal<boolean>(false);

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiHomeBlog
      .getHomeBlogHomeBlogGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data) => {
          this.blogData.set(
            data.sort(
              (a: apiHomeBlogModel, b: apiHomeBlogModel) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
          );
          this.dataLoaded.set(true);
        },
      });
  }

  async onClickLearnMore() {
    const modal = await this.modalController.create({
      component: LearnComponent,
    });

    await modal.present();
  }
}
