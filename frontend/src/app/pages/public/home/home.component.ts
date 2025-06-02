import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { DockService } from '../../../shared/pages/dock/dock.service';

@Component({
  selector: 'app-home',
  imports: [PagesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  titleService = inject(TitleService);
  userAuth = inject(UserAuthService);
  private dockService = inject(DockService);

  constructor() {
    this.titleService.pageTitle.set('Home');
    this.dockService.setPublic();
  }
}
