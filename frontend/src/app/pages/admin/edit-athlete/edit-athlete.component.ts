import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { apiAuthService } from '../../../api/services';
import { apiUserRead } from '../../../api/models';
import { PagesComponent } from '../../../shared/pages/pages.component';
import { TitleService } from '../../../shared/title.service';
import { DockService } from '../../../shared/pages/dock/dock.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/modal/modal.service';
import { UserAuthService } from '../../../shared/user-auth/user-auth.service';

@Component({
  selector: 'app-edit-athlete',
  imports: [PagesComponent, ReactiveFormsModule],
  templateUrl: './edit-athlete.component.html',
  styleUrl: './edit-athlete.component.css',
})
export class EditAthleteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiAuth = inject(apiAuthService);
  private titleService = inject(TitleService);
  private dockService = inject(DockService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private userAuth = inject(UserAuthService);

  private userId: string | null = null;

  user = signal<apiUserRead | null>(null);

  onClickMakeAdmin() {
    const subscription = this.modalService
      .showConfirm('Sure?', `Make ${this.user()?.name} admin?`)
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            console.log('Confirm make admin');
            this.apiAuth
              .usersPatchUserAuthIdPatch({
                id: this.user()!.id,
                body: { is_superuser: true },
              })
              .subscribe({
                next: () => {
                  this.router.navigate(['/admin', 'athletes']);
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
            this.router.navigate(['/admin', 'athletes']);
          } else {
            console.log('Cancel make admin');
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onClickRevokeAdmin() {
    const subscription = this.modalService
      .showConfirm('Sure?', `Revoke admin rights for ${this.user()?.name}?`)
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            console.log('Confirm make admin');
            this.apiAuth
              .usersPatchUserAuthIdPatch({
                id: this.user()!.id,
                body: { is_superuser: false },
              })
              .subscribe({
                next: () => {
                  if (this.user()?.id === this.userAuth.user()?.id) {
                    this.userAuth.logout();
                  } else {
                    this.router.navigate(['/admin', 'athletes']);
                  }
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
          } else {
            console.log('Cancel revoke admin');
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
      .showConfirm('Sure?', `Delete ${this.user()?.name} ?`)
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            console.log('Confirm delete');
            this.apiAuth
              .usersDeleteUserAuthIdDelete({
                id: this.user()!.id,
              })
              .subscribe({
                next: () => {
                  if (this.user()?.id === this.userAuth.user()?.id) {
                    this.userAuth.user.set(null);
                    this.userAuth.token.set(null);
                  } else {
                    this.router.navigate(['/admin', 'athletes']);
                  }
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
          } else {
            console.log('Cancel delete');
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
    effect(() => this.titleService.pageTitle.set(`Edit ${this.user()?.name}`));
    this.dockService.setAdmin();
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');

    if (this.userId) {
      this.apiAuth.usersUserAuthIdGet({ id: this.userId }).subscribe({
        next: (data: apiUserRead) => {
          this.user.set(data);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
    }
  }
}
