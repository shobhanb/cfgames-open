import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/modal/modal.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';
import { apiFirebaseUserRecord } from '../../../api/models';
import { apiFireauthService } from '../../../api/services';

@Component({
  selector: 'app-edit-athlete',
  imports: [PagesComponent, ReactiveFormsModule],
  templateUrl: './edit-athlete.component.html',
  styleUrl: './edit-athlete.component.css',
})
export class EditAthleteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private userAuth = inject(UserAuthService);
  private apiFireauth = inject(apiFireauthService);

  private uid: string | null = null;

  user = signal<apiFirebaseUserRecord | null>(null);

  onClickMakeAdmin() {
    const modalSubscription = this.modalService
      .showConfirm('Sure?', `Make ${this.user()?.display_name} admin?`)
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            this.apiFireauth
              .updateUserAdminRightsFireauthChangeAdminUidPost({
                uid: this.user()!.uid,
                admin: true,
              })
              .subscribe({
                next: () => {
                  this.router.navigate(['/admin', 'athletes']);
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });

    this.destroyRef.onDestroy(() => modalSubscription.unsubscribe());
  }

  onClickRevokeAdmin() {
    const subscription = this.modalService
      .showConfirm(
        'Sure?',
        `Revoke admin rights for ${this.user()?.display_name}?`
      )
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            this.apiFireauth
              .updateUserAdminRightsFireauthChangeAdminUidPost({
                uid: this.user()!.uid,
                admin: false,
              })
              .subscribe({
                next: () => {
                  if (this.user()!.uid === this.userAuth.user()!.uid) {
                    this.userAuth.logout();
                  } else {
                    this.router.navigate(['/admin', 'athletes']);
                  }
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onClickDelete() {
    const subscription = this.modalService
      .showConfirm('Sure?', `Delete ${this.user()?.display_name} ?`)
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            this.apiFireauth
              .deleteUserFireauthUserUidDelete({ uid: this.user()!.uid })
              .subscribe({
                next: () => {
                  if (this.user()!.uid === this.userAuth.user()!.uid) {
                    this.userAuth.logout();
                    this.router.navigate(['/home']);
                  } else {
                    this.router.navigate(['/admin', 'athletes']);
                  }
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onClickCancel() {
    this.router.navigate(['/admin', 'athletes']);
  }

  constructor() {
    effect(() =>
      this.titleService.pageTitle.set(`Edit ${this.user()?.display_name}`)
    );
    this.dockService.setAdmin();
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');

    if (this.uid) {
      this.apiFireauth
        .getUserInfoFireauthUserUidGet({ uid: this.uid })
        .subscribe({
          next: (data: apiFirebaseUserRecord) => {
            this.user.set(data);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
    }
  }
}
