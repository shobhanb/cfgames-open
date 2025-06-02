import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChartBar,
  heroHome,
  heroTrophy,
  heroUserGroup,
  heroUser,
  heroLockClosed,
} from '@ng-icons/heroicons/outline';
import { UserAuthService } from '../../../user-auth/user-auth.service';
import { DockService } from '../dock.service';

@Component({
  selector: 'app-public-dock',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  viewProviders: [
    provideIcons({
      heroHome,
      heroTrophy,
      heroUserGroup,
      heroChartBar,
      heroUser,
      heroLockClosed,
    }),
  ],
  templateUrl: './public-dock.component.html',
  styleUrl: './public-dock.component.css',
})
export class PublicDockComponent {
  userAuth = inject(UserAuthService);
  private dockService = inject(DockService);

  onClickMe() {
    this.dockService.setPrivate();
  }

  onClickAdmin() {
    this.dockService.setAdmin();
  }
}
