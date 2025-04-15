import { TitleCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';
import { AuthService } from '../../../shared/auth/auth.service';

@Component({
  selector: 'app-provider-login',
  imports: [NgIcon, TitleCasePipe],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './provider-login.component.html',
  styleUrl: './provider-login.component.css',
})
export class ProviderLoginComponent {
  auth = inject(AuthService);
  loginSignup = input.required<string>();

  onClickGoogle() {
    this.auth.loginWithGoogle().catch((error: Error) => {
      console.log(error);
    });
  }
}
