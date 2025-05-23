import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<{
    message: string;
    type: 'success' | 'error';
    duration: number;
    redirectUrl: string | null;
  }>();

  toastState$ = this.toastSubject.asObservable();

  private defaultToastDuration = 1000;

  showSuccess(
    message: string,
    redirectUrl: string | null = null,
    duration: number = this.defaultToastDuration
  ) {
    this.toastSubject.next({
      message: message,
      type: 'success',
      duration: duration,
      redirectUrl: redirectUrl,
    });
  }

  showError(
    message: string,
    redirectUrl: string | null = null,
    duration: number = this.defaultToastDuration
  ) {
    this.toastSubject.next({
      message: message,
      type: 'error',
      duration: duration,
      redirectUrl: redirectUrl,
    });
  }
}
