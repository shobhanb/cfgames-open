import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new Subject<{
    title: string;
    message: string;
    redirectUrl: string | null;
  }>();
  modalState$ = this.modalSubject.asObservable();

  show(title: string, message: string, redirectUrl: string | null = null) {
    console.log('Modal service show');
    this.modalSubject.next({
      title: title,
      message: message,
      redirectUrl: redirectUrl,
    });
  }
}
