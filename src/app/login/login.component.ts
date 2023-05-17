import { Component } from '@angular/core';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { CookiesService } from 'src/shared/services/cookies.service';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';

@Component({
  templateUrl: './login.component.html',
  animations: [accountModuleAnimation()]
})
export class LoginComponent { j
  constructor(
    public authService: AppAuthService,
    private _encryptionService: EncryptionService,
    private _cookieService: CookiesService
  ) {
  }

  submitting = false;

  ngOnInit(): void {
    this.getUsernameAndPassword();
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
}
