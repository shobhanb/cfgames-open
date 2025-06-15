import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { apiAuthService } from '../../../api/services';
import { StrictHttpResponse } from '../../../api/strict-http-response';
import { apiUserRead } from '../../../api/models';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-athletes',
  imports: [PagesComponent],
  templateUrl: './athletes.component.html',
  styleUrl: './athletes.component.css',
})
export class AthletesComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private apiAuth = inject(apiAuthService);
  private router = inject(Router);
  userAuth = inject(UserAuthService);

  private _allUsers = signal<apiUserRead[]>([]);

  readonly allUsers = computed<apiUserRead[]>(() =>
    this._allUsers().sort((a: apiUserRead, b: apiUserRead) =>
      a.name > b.name ? 1 : -1
    )
  );

  onClickEdit(user: apiUserRead) {
    this.router.navigate(['/admin', 'edit-athlete', user.id]);
  }

  constructor() {
    this.titleService.pageTitle.set('Athletes Admin');
    this.dockService.setAdmin();
  }

  ngOnInit(): void {
    this.apiAuth.getAllUsersAuthUsersAllGet$Response().subscribe({
      next: (response: StrictHttpResponse<apiUserRead[]>) => {
        this._allUsers.set(response.body);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
