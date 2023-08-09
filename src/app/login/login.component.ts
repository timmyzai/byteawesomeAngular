import { Component } from '@angular/core';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { CookiesService } from 'src/shared/services/cookies.service';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { LoginDto, LoginResultDto, LoginResultDtoResponseDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  templateUrl: './login.component.html',
  animations: [accountModuleAnimation()]
})
export class LoginComponent {
  constructor(
    public appAuthService: AppappAuthService,
    private _encryptionService: EncryptionService,
    private _cookieService: CookiesService,
    private responseHandler: ApiResponseHandlerService,
  ) {
  }
  submitting = false;

  ngOnInit(): void {
    this.getUsernameAndPassword();
  }

  getUsernameAndPassword() {
    this.appAuthService.LoginDto = new LoginDto();
    var username: string = this._cookieService.getCookieValue('UserProfile.UsernameOrEmail');

    if (username) {
      this.appAuthService.LoginDto.userLoginIdentityAddress = this._encryptionService.decrypt(username);
    }

    if (username) {
      this.appAuthService.rememberMe = true;
    }
  }

  login(): void {
    this.submitting = true;
    this.appAuthService.authenticate((loginResult: LoginResultDtoResponseDto) => {
      this.responseHandler.handleResponse<LoginResultDto>(loginResult, null, 'Login Failed');
      this.submitting = false;
    });
  }
}
