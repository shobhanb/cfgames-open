import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroMoon, heroSun } from '@ng-icons/heroicons/outline';
import { TitleService } from '../../title.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserAuthService } from '../../user-auth/user-auth.service';
import { ToastService } from '../../toast/toast.service';
import { LoggedInButtonComponent } from './logged-in-button/logged-in-button.component';
import { EventService } from '../../event.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-nav-menu',
  imports: [NgIcon, RouterLink, RouterLinkActive, LoggedInButtonComponent],
  viewProviders: [provideIcons({ heroBars3, heroSun, heroMoon })],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css',
})
export class NavMenuComponent {
  titleService = inject(TitleService);
  userAuth = inject(UserAuthService);
  private toastService = inject(ToastService);
  themeService = inject(ThemeService);
  private eventService = inject(EventService);

  constructor() {
    this.eventService.initialize();
  }
}
