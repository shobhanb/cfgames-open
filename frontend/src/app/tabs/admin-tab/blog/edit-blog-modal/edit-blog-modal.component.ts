import { DatePipe } from '@angular/common';
import { Component, inject, Input, input, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonHeader,
  IonButton,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonSearchbar,
  IonList,
  IonContent,
  IonItem,
  ModalController,
  IonTextarea,
  IonInput,
  IonLabel,
} from '@ionic/angular/standalone';
import { timer } from 'rxjs';
import { apiHomeBlogModel, apiCreateHomeBlogModel } from 'src/app/api/models';

@Component({
  selector: 'app-edit-blog-modal',
  templateUrl: './edit-blog-modal.component.html',
  styleUrls: ['./edit-blog-modal.component.scss'],
  imports: [
    IonLabel,
    IonInput,
    IonItem,
    IonContent,
    IonList,
    IonSearchbar,
    IonButtons,
    IonHeader,
    IonButton,
    IonTitle,
    IonToolbar,
    IonTextarea,
    ReactiveFormsModule,
    DatePipe,
  ],
})
export class EditBlogModalComponent implements OnInit {
  private modalController = inject(ModalController);

  @Input() blog: apiHomeBlogModel | null = null;

  blogForm = new FormGroup({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    subtitle: new FormControl<string | null>(null),
    content: new FormControl('', { validators: [Validators.required] }),
    image_link: new FormControl<string | null>(null),
    action_link: new FormControl<string | null>(null),
    action_text: new FormControl<string | null>(null),
  });

  constructor() {}

  ngOnInit() {
    if (this.blog) {
      this.blogForm.patchValue({
        title: this.blog.title,
        subtitle: this.blog.subtitle,
        content: this.blog.content,
        image_link: this.blog.image_link,
        action_link: this.blog.action_link,
        action_text: this.blog.action_text,
      });
    }
  }

  isFormValid() {
    return this.blogForm.valid && this.blogForm.dirty;
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.modalController.dismiss(
        this.blogForm.value as apiCreateHomeBlogModel
      );
    }
  }

  close() {
    this.modalController.dismiss();
  }

  onClickCancel() {
    this.blogForm.reset();
    this.modalController.dismiss();
  }
}
