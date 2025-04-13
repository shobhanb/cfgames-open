import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AuthService } from '../../shared/auth/auth.service';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-auth',
  imports: [SignupComponent, LandingComponent, LoginComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  auth = inject(AuthService);
}
