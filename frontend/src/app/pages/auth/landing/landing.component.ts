import { Component, inject, OnInit } from '@angular/core';
import { AuthWrapperComponent } from '../auth-wrapper/auth-wrapper.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/auth/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-landing',
  imports: [AuthWrapperComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private auth = inject(AuthService);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    if (!!this.auth.user()) {
      this.modalService.show(
        'Uh oh',
        'Already logged in. Sign out if you want to switch user',
        '/home'
      );
    }
  }
}
