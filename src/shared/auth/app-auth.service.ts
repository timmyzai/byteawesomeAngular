import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { CookiesService } from '../services/cookies.service';
import { LoginDto, LoginResultDto, LoginResultDtoResponseDto, LoginResultType, UserServiceProxy } from '../service-proxies/user-service-proxies';

@Injectable()
export class AppappAuthService {
  LoginDto: LoginDto;
  loginResult: LoginResultDtoResponseDto;
  rememberMe: boolean = false;

  constructor(
    private _userService: UserServiceProxy,
    private _router: Router,
    private _encryptionService: EncryptionService,
    private _cookieService: CookiesService,
  ) {
    this.clear();
  }

  logout(reload?: boolean): void {
    this._cookieService.deleteCookie(AppConsts.authorization.encryptedAuthTokenName);
    this._cookieService.deleteCookie("accessToken");
    localStorage.clear();

    if (reload !== false) {
      location.href = AppConsts.appBaseUrl;
    }
  }

  authenticate(callback: (result: LoginResultDtoResponseDto) => void) {
    this._userService.login(this.LoginDto)
      .pipe(
        finalize(() => {
          callback(this.loginResult);
        })
      ).subscribe((result: LoginResultDtoResponseDto) => {
        this.loginResult = result;
        this.processAuthenticateResult(result.result);
      });
  }

  private processAuthenticateResult(loginResult: LoginResultDto): void {
    const loginResultType = loginResult.loginResult;

    if (loginResultType == LoginResultType.RequireOtpToVerifyEmail) {
      this._router.navigate(['confirmation-auth-page']);
      var encryptedUsernameOrEmail = this._encryptionService.encrypt(this.LoginDto.userLoginIdentityAddress);
      var expiryDate = new Date(new Date().getTime() + 5 * 365 * 86400000); // 5 year
      this._cookieService.setCookieValue('UserProfile.UsernameOrEmail', encryptedUsernameOrEmail, expiryDate);
      return;
    }
    if (loginResultType == LoginResultType.RequireTwoFactorPin) {
      this._router.navigate(['two-factor-auth-page']);
      return;
    }

    const encryptedAccessToken = loginResult.encryptedAccessToken;
    const expireInSeconds = loginResult.expireInSeconds;
    const userId = loginResult.userId;

    if (loginResultType == LoginResultType.Success) {
      this.login(encryptedAccessToken, expireInSeconds, userId, this.rememberMe);
      return;
    }
  }

  private login(
    encryptedAccessToken: string,
    expireInSeconds: number,
    userId: string,
    rememberMe?: boolean
  ): void {
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * expireInSeconds);

    this._cookieService.setCookieValue(AppConsts.authorization.encryptedAuthTokenName, encryptedAccessToken, tokenExpireDate);
    localStorage.setItem('loggedInUserId', userId.toString());

    if (rememberMe) {
      var encryptedUsernameOrEmail = this._encryptionService.encrypt(this.LoginDto.userLoginIdentityAddress);
      var expiryDate = new Date(new Date().getTime() + 5 * 365 * 86400000); // 5 year
      this._cookieService.setCookieValue('UserProfile.UsernameOrEmail', encryptedUsernameOrEmail, expiryDate);
    } else {
      this._cookieService.deleteCookie('UserProfile.UsernameOrEmail');
    }

    location.href = AppConsts.appBaseUrl + "/home";
  }

  private clear(): void {
    this.LoginDto = new LoginDto();
    this.loginResult = null;
    this.rememberMe = false;
  }
}
