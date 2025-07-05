import { Component, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { IonButtons, IonIcon } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  imports: [IonIcon, IonButtons],
})
export class ThemeComponent {
  themeService = inject(ThemeService);

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  onToggleClick() {
    this.themeService.toggleTheme();
  }
}
