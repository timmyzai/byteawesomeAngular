import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppAuthService } from 'src/shared/auth/app-auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(
    public authService: AppAuthService,
    private route: Router
  ) {
  }
  logout(): void {
    this.authService.logout();
  }

  secret(): void {

  }

  twoFactorSetup() {
    this.route.navigate(["two-factor-auth-setup"]);
  }
}


