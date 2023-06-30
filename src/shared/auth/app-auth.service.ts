import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { AuthenticateModel, AuthenticateResultModel, AuthenticateResultModelResponseDto, AuthenticationServiceProxy, } from 'src/shared/service-proxies/auth-service-proxies';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { CookiesService } from '../services/cookies.service';

@Injectable()
export class AppAuthService {
  authenticateModel: AuthenticateModel;
  authenticateResult: AuthenticateResultModelResponseDto;
  rememberMe: boolean = false;

  constructor(
    private _tokenAuthService: AuthenticationServiceProxy,
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

  authenticate(callback: (result: AuthenticateResultModelResponseDto) => void) {
    this._tokenAuthService.authenticate(this.authenticateModel)
      .pipe(
        finalize(() => {
          callback(this.authenticateResult);
        })
      ).subscribe((result: AuthenticateResultModelResponseDto) => {
        this.authenticateResult = result;
        if (result.isSuccess) {
          this.processAuthenticateResult(result.result);
        }
      });
  }

  private processAuthenticateResult(authenticateResult: AuthenticateResultModel): void {
    const requireTwoFactorPin = authenticateResult.requireTwoFactorPin;
    const twoFactorPin = this.authenticateModel.twoFactorPin;
    const requireEmailTacCode = authenticateResult.requireEmailTacCode;
    const emailTacCode = this.authenticateModel.emailTacCode;
    if (requireEmailTacCode && emailTacCode == null) {
      this._router.navigate(['confirmation-auth-page']);
      var encryptedUsernameOrEmail = this._encryptionService.encrypt(this.authenticateModel.userLoginIdentity);
      var expiryDate = new Date(new Date().getTime() + 5 * 365 * 86400000); // 5 year
      this._cookieService.setCookieValue('UserProfile.UsernameOrEmail', encryptedUsernameOrEmail, expiryDate);
      return;
    }
    if (requireTwoFactorPin && twoFactorPin == null) {
      this._router.navigate(['two-factor-auth-page']);
      return;
    }

    const accessToken = authenticateResult.accessToken;
    const encryptedAccessToken = authenticateResult.encryptedAccessToken;
    const expireInSeconds = authenticateResult.expireInSeconds;
    const userId = authenticateResult.userId;

    if (accessToken) {
      this.login(accessToken, encryptedAccessToken, expireInSeconds, userId, this.rememberMe);
    } else {
      console.error('Unexpected authenticateResult!');
      this._router.navigate(['login']);
    }
  }

  private login(
    accessToken: string,
    encryptedAccessToken: string,
    expireInSeconds: number,
    userId: string,
    rememberMe?: boolean
  ): void {
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * expireInSeconds);

    this._cookieService.setCookieValue("accessToken", accessToken, tokenExpireDate);
    this._cookieService.setCookieValue(AppConsts.authorization.encryptedAuthTokenName, encryptedAccessToken, tokenExpireDate);
    localStorage.setItem('loggedInUserId', userId.toString());

    if (rememberMe) {
      var encryptedUsernameOrEmail = this._encryptionService.encrypt(this.authenticateModel.userLoginIdentity);
      var expiryDate = new Date(new Date().getTime() + 5 * 365 * 86400000); // 5 year
      this._cookieService.setCookieValue('UserProfile.UsernameOrEmail', encryptedUsernameOrEmail, expiryDate);
    } else {
      this._cookieService.deleteCookie('UserProfile.UsernameOrEmail');
    }

    location.href = AppConsts.appBaseUrl + "/home";
  }

  private clear(): void {
    this.authenticateModel = new AuthenticateModel();
    this.authenticateModel.rememberClient = false;
    this.authenticateResult = null;
    this.rememberMe = false;
  }
}
