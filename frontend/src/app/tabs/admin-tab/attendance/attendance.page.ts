import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../../shared/auth-state/auth-state.component';
import { ThemeComponent } from '../../../shared/theme/theme.component';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonBackButton,
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
export class AttendancePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
