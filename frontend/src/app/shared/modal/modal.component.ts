import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnInit {
  modalService = inject(ModalService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  modalTitle = signal<string>('');
  modalMessage = signal<string>('');
  modalShow = signal<boolean>(false);
  modalRedirectUrl = signal<string | null>(null);

  modalSubscription$: Subscription | undefined;

  ngOnInit(): void {
    this.modalSubscription$ = this.modalService.modalState$.subscribe(
      ({ title, message, redirectUrl }) => {
        this.modalTitle.set(title);
        this.modalMessage.set(message);
        this.modalRedirectUrl.set(redirectUrl);
        this.modalShow.set(true);
      }
    );

    this.destroyRef.onDestroy(() => {
      this.modalSubscription$?.unsubscribe();
    });
  }

  closeModal() {
    this.modalShow.set(false);
    if (this.modalRedirectUrl()) {
      this.router.navigate([this.modalRedirectUrl()]);
    }
  }
}
