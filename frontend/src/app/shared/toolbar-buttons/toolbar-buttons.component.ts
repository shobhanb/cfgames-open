import { Component, OnInit } from '@angular/core';
import { IonButtons } from '@ionic/angular/standalone';
import { ThemeComponent } from './theme/theme.component';
import { AuthStateComponent } from './auth-state/auth-state.component';

@Component({
  selector: 'app-toolbar-buttons',
  templateUrl: './toolbar-buttons.component.html',
  styleUrls: ['./toolbar-buttons.component.scss'],
  imports: [ThemeComponent, AuthStateComponent, IonButtons],
})
export class ToolbarButtonsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
