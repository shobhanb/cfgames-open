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
} from '@ionic/angular/standalone';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiHomeBlogService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';
import { apiHomeBlogModel } from 'src/app/api/models';
import { RouterLink } from '@angular/router';
import { AppInstallService } from 'src/app/services/app-install.service';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.page.html',
  styleUrls: ['./home-tab.page.scss'],
  standalone: true,
  imports: [
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
  apiHomeBlog = inject(apiHomeBlogService);
  appInstallService = inject(AppInstallService);

  blogData = signal<apiHomeBlogModel[]>([]);

  constructor() {}

  dataLoaded = false;

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiHomeBlog
      .getHomeBlogHomeBlogGet({
        affiliate_id: environment.affiliateId,
        year: environment.year,
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
          this.dataLoaded = true;
        },
      });
  }
}
