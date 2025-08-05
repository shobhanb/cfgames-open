import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSkeletonText,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  documentTextOutline,
  openOutline,
} from 'ionicons/icons';
import { ToolbarButtonsComponent } from 'src/app/shared/toolbar-buttons/toolbar-buttons.component';
import { apiHomeBlogService } from 'src/app/api/services';
import { apiHomeBlogModel } from 'src/app/api/models/api-home-blog-model';
import { apiCreateHomeBlogModel } from 'src/app/api/models';
import { ToastService } from 'src/app/services/toast.service';
import { EditBlogModalComponent } from './edit-blog-modal/edit-blog-modal.component';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.page.html',
  styleUrls: ['./blog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonText,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSkeletonText,
    ToolbarButtonsComponent,
    DatePipe,
  ],
})
export class BlogPage implements OnInit {
  private apiHomeBlogService = inject(apiHomeBlogService);
  private toastService = inject(ToastService);
  private modalController = inject(ModalController);
  private config = inject(AppConfigService);

  dataLoaded = signal<boolean>(false);
  blogData = signal<apiHomeBlogModel[]>([]);

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      documentTextOutline,
      openOutline,
    });
  }

  handleRefresh(event: CustomEvent) {
    this.getData();
    (event.target as HTMLIonRefresherElement).complete();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.dataLoaded.set(false);

    this.apiHomeBlogService
      .getHomeBlogHomeBlogGet({
        affiliate_id: this.config.affiliateId,
        year: this.config.year,
      })
      .subscribe({
        next: (data: apiHomeBlogModel[]) => {
          this.blogData.set(
            data.sort((a, b) => {
              return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
            })
          );
          this.dataLoaded.set(true);
        },
        error: (error: any) => {
          this.toastService.showToast('Failed to load blog posts', 'danger');
        },
      });
  }

  async presentModal(blog?: apiHomeBlogModel) {
    const modal = await this.modalController.create({
      component: EditBlogModalComponent,
      componentProps: {
        blog,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async onClickEdit(blog: apiHomeBlogModel) {
    const data = await this.presentModal(blog);

    if (data) {
      this.apiHomeBlogService
        .updateHomeBlogHomeBlogPatch({
          _id: blog.id,
          body: data as apiCreateHomeBlogModel,
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Blog post updated successfully',
              'success'
            );
            this.getData();
          },
          error: (error: any) => {
            this.toastService.showToast('Failed to update blog post', 'danger');
          },
        });
    }
  }

  async onClickCreate() {
    const data = await this.presentModal();

    if (data) {
      this.apiHomeBlogService
        .addHomeBlogHomeBlogPost({
          affiliate_id: this.config.affiliateId,
          year: this.config.year,
          body: data as apiCreateHomeBlogModel,
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Blog post created successfully',
              'success'
            );
            this.getData();
          },
          error: (error: any) => {
            this.toastService.showToast('Failed to create blog post', 'danger');
          },
        });
    }
  }

  async onClickDelete(blog: apiHomeBlogModel) {
    this.apiHomeBlogService
      .deleteHomeBlogHomeBlogDelete({ _id: blog.id })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Blog post deleted successfully',
            'success'
          );
          this.getData();
        },
        error: (error: any) => {
          this.toastService.showToast('Failed to delete blog post', 'danger');
        },
      });
  }
}
