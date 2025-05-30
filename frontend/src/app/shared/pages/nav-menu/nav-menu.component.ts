import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3 } from '@ng-icons/heroicons/outline';
import { TitleService } from '../../title.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserAuthService } from '../../user-auth/user-auth.service';
import { ToastService } from '../../toast/toast.service';
import { LoggedInButtonComponent } from './logged-in-button/logged-in-button.component';
import { ordinalMap } from '../../ordinal-mapping';

@Component({
  selector: 'app-nav-menu',
  imports: [NgIcon, RouterLink, RouterLinkActive, LoggedInButtonComponent],
  viewProviders: [provideIcons({ heroBars3 })],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css',
})
export class NavMenuComponent {
  titleService = inject(TitleService);
  userAuth = inject(UserAuthService);
  toastService = inject(ToastService);

  events = Object.entries(ordinalMap);
}
