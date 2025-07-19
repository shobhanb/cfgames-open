import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { apiAppreciationService } from 'src/app/api/services';
import { apiAppreciationModel } from 'src/app/api/models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-appreciation-results',
  templateUrl: './appreciation-results.page.html',
  styleUrls: ['./appreciation-results.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AppreciationResultsPage implements OnInit {
  private apiAppreciationService = inject(apiAppreciationService)

  appreciationResults = signal<apiAppreciationModel[]>([]);

  constructor() { }

  ngOnInit() {
  }

  getData() {
    this.apiAppreciationService.getAllAppreciationAppreciationAllGet({affiliate_id: environment.affiliateId, year: }).subscribe({
      next: (data) => {
        this.appreciationResults.set(data);
      },
      error: (error) => {
        console.error('Error fetching appreciation results:', error);
      }
    });
  }

}
