import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-appreciation-result',
  templateUrl: './appreciation-result.page.html',
  styleUrls: ['./appreciation-result.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class AppreciationResultPage implements OnInit {
  private apiAppreciation = inject(apiAppreciationService);

  @Input({ required: true }) year: number = 0;
  @Input({ required: true }) ordinal: number = 0;

  dataLoaded = false;

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getData() {
    this.apiAppreciation.getAllAppreciationAppreciationAllGet({
      affiliate_id: environment.affiliateId,
      year: this.year,
      ordinal: this.ordinal,
    });
  }
}
