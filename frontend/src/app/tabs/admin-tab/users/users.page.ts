import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonSkeletonText,
  IonSearchbar,
  IonNote,
  IonIcon,
  IonButton,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { apiFireauthService } from 'src/app/api/services';
import { apiFirebaseUserRecord } from 'src/app/api/models';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { ellipsisHorizontalOutline } from 'ionicons/icons';
import { AlertService } from 'src/app/services/alert.service';
import { ToastService } from 'src/app/services/toast.service';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonNote,
    IonSearchbar,
    IonSkeletonText,
    IonItem,
    IonLabel,
    IonSegmentButton,
    IonSegment,
    IonList,
    IonRefresherContent,
    IonRefresher,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ToolbarButtonsComponent,
  ],
})
export class UsersPage implements OnInit {
  private apiFireAuth = inject(apiFireauthService);
  private alertService = inject(AlertService);
  private toastService = inject(ToastService);
  private actionSheetController = inject(ActionSheetController);
  private config = inject(AppConfigService);
  authService = inject(AuthService);

  dataLoaded = signal<boolean>(false);

  private allUsers = signal<apiFirebaseUserRecord[]>([]);

  readonly filteredUsers = computed<apiFirebaseUserRecord[]>(() => {
    const users = this.allUsers();
    const search = this.searchText();
    const adminOnly = this.filterAdmin();
    if (search) {
      return users.filter(
        (user) =>
          user.email?.toLowerCase().includes(search) ||
          user.display_name?.toLowerCase().includes(search)
      );
    } else if (adminOnly === 'admin') {
      return users.filter((user) => user.custom_claims?.admin === true);
    } else if (adminOnly === 'notVerified') {
      return users.filter((user) => user.email_verified === false);
    } else {
      return users;
    }
  });

  filterAdmin = signal<'admin' | 'notVerified' | 'all'>('all');
  searchText = signal<string | null>(null);

  onSelectionChanged(event: CustomEvent) {
    this.filterAdmin.set(event.detail.value);
  }

  onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
    if (target.value) {
      this.filterAdmin.set('all');
    }
  }

  async presentActionSheet(user: apiFirebaseUserRecord) {
    const actionSheet = await this.actionSheetController.create({
      header: user.display_name!,
      buttons: [
        {
          text: user.custom_claims?.admin
            ? 'Revoke Admin Rights'
            : 'Make Admin',
          data: {
            action: 'admin',
          },
        },
        {
          text: 'Delete User',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    if (result.data && result.data.action === 'delete') {
      await this.onClickDelete(user);
    } else if (result.data && result.data.action === 'admin') {
      await this.onClickAdmin(user);
    }
  }

  async onClickAdmin(user: apiFirebaseUserRecord) {
    const admin = user.custom_claims!.admin;
    const alertText = admin
      ? `Revoke admin rights for ${user.display_name}?`
      : `Make ${user.display_name} admin?`;
    const result = await this.alertService.showAlert(alertText);

    if (result.role === 'confirm') {
      this.apiFireAuth
        .updateUserAdminRightsFireauthChangeAdminUidPost({
          uid: user.uid,
          admin: !admin,
        })
        .subscribe({
          next: () => {
            const currentUser = this.authService.user();
            if (currentUser && currentUser.uid === user.uid) {
              this.authService.logout();
            } else {
              this.getData();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.showToast(err.message, 'danger', null, 3000);
          },
        });
    }
  }

  async onClickDelete(user: apiFirebaseUserRecord) {
    const result = await this.alertService.showAlert(
      `Delete ${user.display_name}?`
    );

    if (result.role === 'confirm') {
      this.apiFireAuth
        .deleteUserFireauthUserUidDelete({ uid: user.uid })
        .subscribe({
          next: () => {
            const currentUser = this.authService.user();
            if (currentUser && currentUser.uid === user.uid) {
              this.authService.logout();
            } else {
              this.getData();
            }
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.showToast(err.message, 'danger', null, 3000);
          },
        });
    }
  }

  constructor() {
    addIcons({
      ellipsisHorizontalOutline,
    });
  }

  private getData() {
    this.apiFireAuth.getAllUsersFireauthAllGet().subscribe({
      next: (data: apiFirebaseUserRecord[]) => {
        this.allUsers.set(
          data
            .filter(
              (user: apiFirebaseUserRecord) =>
                user.custom_claims?.affiliate_id === this.config.affiliateId
            )
            .sort((a: apiFirebaseUserRecord, b: apiFirebaseUserRecord) => {
              const nameA = a.display_name?.toLowerCase() || '';
              const nameB = b.display_name?.toLowerCase() || '';
              return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
            })
        );
        this.dataLoaded.set(true);
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.showToast(err.message, 'danger', null, 3000);
      },
    });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded.set(false);
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {
    this.getData();
  }
}
