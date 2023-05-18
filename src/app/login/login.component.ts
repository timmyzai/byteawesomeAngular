import { Component } from '@angular/core';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { CookiesService } from 'src/shared/services/cookies.service';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { Router } from '@angular/router';
import { AppConsts } from 'src/shared/AppConsts';

@Component({
  templateUrl: './login.component.html',
  animations: [accountModuleAnimation()]
})
export class LoginComponent {
  constructor(
    public authService: AppAuthService,
    private _encryptionService: EncryptionService,
    private _cookieService: CookiesService,
    private route: Router
  ) {
  }
  submitting = false;

  ngOnInit(): void {
    this.getUsernameAndPassword();
    this.checkUserLogin();
  }

  getUsernameAndPassword() {
    var username: string = this._cookieService.getCookieValue('UserProfile.UsernameOrEmail');

    if (username) {
      this.authService.authenticateModel.userNameOrEmailAddress = this._encryptionService.decrypt(username);
    }

    if (username) {
      this.authService.authenticateModel.rememberClient = true;
      this.authService.rememberMe = true;
    }
  }

  login(): void {
    this.submitting = true;
    this.authService.authenticate(() => (this.submitting = false));
  }

  checkUserLogin() {
    const accessToken = this._cookieService.getCookieValue('accessToken');
    const encryptedAccessToken = this._cookieService.getCookieValue(AppConsts.authorization.encryptedAuthTokenName);

    if (accessToken && encryptedAccessToken) {
      this.route.navigate(["home"]);
    }
  }
}
