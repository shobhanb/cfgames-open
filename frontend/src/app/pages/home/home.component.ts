import { Component, inject } from '@angular/core';
import { PagesComponent } from '../../shared/pages/pages.component';
import { TitleService } from '../../shared/title.service';
import { UserAuthService } from '../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-home',
  imports: [PagesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  titleService = inject(TitleService);
  userAuth = inject(UserAuthService);

  constructor() {
    this.titleService.pageTitle.set('Home');
  }
}
