import { Component, inject, OnInit } from '@angular/core';
import { IonToast } from '@ionic/angular/standalone';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [IonToast],
})
export class ToastComponent implements OnInit {
  toastService = inject(ToastService);

  toastButtons = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ];

  constructor() {}

  ngOnInit() {}
}
