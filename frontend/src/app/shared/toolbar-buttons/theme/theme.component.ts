import { Component, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  imports: [IonButton, IonIcon],
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
