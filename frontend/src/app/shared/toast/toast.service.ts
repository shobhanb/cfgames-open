import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  router = inject(Router);

  readonly isOpen = signal<boolean>(false);
  readonly color = signal<'primary' | 'success' | 'warning' | 'danger'>(
    'success'
  );
  readonly message = signal<string | null>(null);

  showToast(
    message: string,
    color: 'primary' | 'success' | 'warning' | 'danger' = 'success',
    redirectUrl: string | null = null,
    duration: number = 2000
  ) {
    this.message.set(message);
    this.color.set(color);
    this.isOpen.set(true);

    timer(duration).subscribe(() => {
      this.isOpen.set(false);
      if (redirectUrl) {
        this.router.navigateByUrl(redirectUrl);
      }
    });
  }

  show404() {
    return this.showToast('Invalid URL', 'danger', '/', 2000);
  }

  constructor() {}
}
