import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../../shared/auth-state/auth-state.component';
import { ThemeComponent } from '../../../shared/theme/theme.component';

@Component({
  selector: 'app-side-scores',
  templateUrl: './side-scores.page.html',
  styleUrls: ['./side-scores.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    AuthStateComponent,
    ThemeComponent,
  ],
})
export class SideScoresPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
