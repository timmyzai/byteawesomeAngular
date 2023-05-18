import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import {
  AuthenticateModel,
  AuthenticateResultModel,
  AuthenticationServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { CookiesService } from '../services/cookies.service';

@Injectable()
export class AppAuthService {
  authenticateModel: AuthenticateModel;
  authenticateResult: AuthenticateResultModel;
  rememberMe: boolean;

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

    if (reload !== false) {
      location.href = AppConsts.appBaseUrl;
    }
  }

  authenticate(finallyCallback?: () => void): void {
    finallyCallback = finallyCallback || (() => { });

    this._tokenAuthService.authenticate(this.authenticateModel)
      .pipe(
        finalize(() => {
          finallyCallback();
        })
      )
      .subscribe((result: AuthenticateResultModel) => {
        this.processAuthenticateResult(result);
      });
  }

  private processAuthenticateResult(
    authenticateResult: AuthenticateResultModel
  ) {
    this.authenticateResult = authenticateResult;

    if (
      this.authenticateResult.require2fa &&
      this.authenticateModel.twoFactorPin == null
    ) {
      this._router.navigate(['two-factor-auth-page']);
    } else {
      if (authenticateResult.accessToken) {
        this.login(
          authenticateResult.accessToken,
          authenticateResult.encryptedAccessToken,
          authenticateResult.expireInSeconds,
          this.rememberMe
        );
      } else {
        console.error('Unexpected authenticateResult!');
        this._router.navigate(['login']);
      }
    }
  }

  private login(
    accessToken: string,
    encryptedAccessToken: string,
    expireInSeconds: number,
    rememberMe?: boolean
  ): void {
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * expireInSeconds);

    this._cookieService.setCookieValue("accessToken", accessToken, tokenExpireDate);
    this._cookieService.setCookieValue(AppConsts.authorization.encryptedAuthTokenName, encryptedAccessToken, tokenExpireDate);

    if (rememberMe) {
      var encryptedUsernameOrEmail = this._encryptionService.encrypt(this.authenticateModel.userNameOrEmailAddress);
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
