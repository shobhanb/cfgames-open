import { TitleCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { ionLogoYahoo, ionMail } from '@ng-icons/ionicons';

@Component({
  selector: 'app-provider-login',
  imports: [TitleCasePipe],
  viewProviders: [provideIcons({ ionLogoYahoo, ionMail })],
  templateUrl: './provider-login.component.html',
  styleUrl: './provider-login.component.css',
})
export class ProviderLoginComponent {
  loginSignup = input.required<string>();

  onClickGoogle() {}
}
