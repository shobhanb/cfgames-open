import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { Router } from '@angular/router';
import { apiFireauthService } from '../../../api/services';
import { apiFirebaseUserRecord } from '../../../api/models';

@Component({
  selector: 'app-athletes',
  imports: [PagesComponent],
  templateUrl: './athletes.component.html',
  styleUrl: './athletes.component.css',
})
export class AthletesComponent implements OnInit {
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private apiFireauth = inject(apiFireauthService);
  private router = inject(Router);
  userAuth = inject(UserAuthService);

  private _allUsers = signal<apiFirebaseUserRecord[]>([]);

  readonly allUsers = computed<apiFirebaseUserRecord[]>(() =>
    this._allUsers().sort(
      (a: apiFirebaseUserRecord, b: apiFirebaseUserRecord) => {
        const nameA = a.display_name ?? '';
        const nameB = b.display_name ?? '';
        return nameA > nameB ? 1 : -1;
      }
    )
  );

  onClickEdit(user: apiFirebaseUserRecord) {
    this.router.navigate(['/admin', 'edit-athlete', user.uid]);
  }

  constructor() {
    this.titleService.pageTitle.set('Athletes Admin');
    this.dockService.setAdmin();
  }

  ngOnInit(): void {
    this.apiFireauth.getAllUsersFireauthAllGet().subscribe({
      next: (data: apiFirebaseUserRecord[]) => {
        this._allUsers.set(data);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
