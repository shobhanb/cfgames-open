import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<{
    message: string;
    type: 'success' | 'error';
    redirectUrl: string | null;
  }>();
  toastState$ = this.toastSubject.asObservable();

  showSuccess(message: string, redirectUrl: string | null = null) {
    this.toastSubject.next({
      message: message,
      type: 'success',
      redirectUrl: redirectUrl,
    });
  }

  showError(message: string, redirectUrl: string | null = null) {
    this.toastSubject.next({
      message: message,
      type: 'error',
      redirectUrl: redirectUrl,
    });
  }
}
