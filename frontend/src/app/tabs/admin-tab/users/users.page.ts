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
  IonPopover,
  IonButton,
  PopoverController,
} from '@ionic/angular/standalone';
import { AuthStateComponent } from '../../../shared/auth-state/auth-state.component';
import { apiFireauthService } from 'src/app/api/services';
import { apiFirebaseUserRecord } from 'src/app/api/models';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { ellipsisHorizontalOutline } from 'ionicons/icons';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonPopover,
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
    AuthStateComponent,
  ],
})
export class UsersPage implements OnInit {
  private apiFireAuth = inject(apiFireauthService);
  private popoverController = inject(PopoverController);
  private alertService = inject(AlertService);
  authService = inject(AuthService);

  dataLoaded = false;

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
    } else if (adminOnly) {
      return users.filter((user) => user.custom_claims?.admin === true);
    } else {
      return users;
    }
  });

  filterAdmin = signal<boolean>(false);
  searchText = signal<string | null>(null);

  onSelectionChanged(event: CustomEvent) {
    this.filterAdmin.set(event.detail.value);
  }

  onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
    if (target.value) {
      this.filterAdmin.set(false);
    }
  }

  async onClickAdmin(uid: string, admin: boolean) {
    const user = this.allUsers().filter(
      (value: apiFirebaseUserRecord) => value.uid === uid
    )[0].display_name;

    const alertText = admin
      ? `Make ${user} admin?`
      : `Revoke admin rights for ${user}?`;
    const result = await this.alertService.showAlert(alertText);
    this.popoverController.dismiss();

    if (result === 'confirm') {
      this.apiFireAuth
        .updateUserAdminRightsFireauthChangeAdminUidPost({
          uid: uid,
          admin: admin,
        })
        .subscribe({
          next: () => {
            const currentUser = this.authService.user();
            if (currentUser && currentUser.uid === uid) {
              this.authService.logout();
            } else {
              this.getData();
            }
          },
          error: (err: any) => {
            console.error(err);
          },
        });
    }
  }

  async onClickDelete(uid: string) {
    const user = this.allUsers().filter(
      (value: apiFirebaseUserRecord) => value.uid === uid
    )[0].display_name;

    const result = await this.alertService.showAlert(`Delete ${user}?`);
    this.popoverController.dismiss();

    if (result === 'confirm') {
      this.apiFireAuth.deleteUserFireauthUserUidDelete({ uid: uid }).subscribe({
        next: () => {
          const currentUser = this.authService.user();
          if (currentUser && currentUser.uid === uid) {
            this.authService.logout();
          } else {
            this.getData();
          }
        },
        error: (err: any) => {
          console.error(err);
        },
      });
    }
  }

  constructor() {
    addIcons({
      ellipsisHorizontalOutline,
    });
  }

  // showAlert moved to AlertService

  private getData() {
    this.apiFireAuth.getAllUsersFireauthAllGet().subscribe({
      next: (data: apiFirebaseUserRecord[]) => {
        this.allUsers.set(data);
        this.dataLoaded = true;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  handleRefresh(event: CustomEvent) {
    this.dataLoaded = false;
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {
    this.getData();
  }
}
