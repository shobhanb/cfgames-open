import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalMessage } from './modal-message';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _modalMessage = signal<ModalMessage | null>(null);
  private confirmationSubject = new Subject<boolean>();

  readonly modalMessage = this._modalMessage.asReadonly();

  showInfo(title: string, message: string, redirectUrl: string | null = null) {
    this._modalMessage.set({
      type: 'info',
      title: title,
      message: message,
      redirectUrl: redirectUrl,
    });
  }

  showConfirm(title: string, message: string) {
    this._modalMessage.set({
      type: 'confirm',
      title: title,
      message: message,
      redirectUrl: null,
    });

    this.confirmationSubject = new Subject<boolean>();
    return this.confirmationSubject.asObservable();
  }

  confirm(confirmed: boolean) {
    this.confirmationSubject.next(confirmed);
    this.confirmationSubject.complete();
    this._modalMessage.set(null);
  }

  reset() {
    this._modalMessage.set(null);
  }
}
