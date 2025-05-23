import { Component, effect, inject } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-landing',
  imports: [AuthWrapperComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  toastService = inject(ToastService);

  onTest() {
    this.toastService.showSuccess('Success');
  }

  constructor() {
    effect(() => {});
  }
}
