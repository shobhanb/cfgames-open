import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AuthService } from '../../shared/auth/auth.service';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  auth = inject(AuthService);
}
