import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  modalService = inject(ModalService);
  private router = inject(Router);

  confirmModal(confirmed: boolean) {
    this.modalService.confirm(confirmed);
  }

  closeModal() {
    const redirectUrl = this.modalService.modalMessage()!.redirectUrl;
    this.modalService.reset();
    if (redirectUrl) {
      this.router.navigate([redirectUrl]);
    }
  }
}
