import { Component, input, OnInit } from '@angular/core';
import {
  IonToolbar,
  IonTitle,
  IonHeader,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from './auth-state/auth-state.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    AuthStateComponent,
  ],
})
export class HeaderComponent implements OnInit {
  title = input.required<string>();
  backLink = input<string | null>(null);

  constructor() {}

  ngOnInit() {}
}
