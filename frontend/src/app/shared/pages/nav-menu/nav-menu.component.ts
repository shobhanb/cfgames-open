import { Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3 } from '@ng-icons/heroicons/outline';
import { TitleService } from '../../title.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nav-menu',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  viewProviders: [provideIcons({ heroBars3 })],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css',
})
export class NavMenuComponent {
  titleService = inject(TitleService);
  auth = inject(AuthService);
  router = inject(Router);

  onClickSignOut() {
    this.auth.logout();
  }
}
