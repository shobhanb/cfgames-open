import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { ModalComponent } from './shared/modal/modal.component';
import { UserAuthService } from './shared/user-auth/user-auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private userAuth = inject(UserAuthService);

  ngOnInit(): void {
    this.userAuth.loginWithLocalToken();
  }
}
