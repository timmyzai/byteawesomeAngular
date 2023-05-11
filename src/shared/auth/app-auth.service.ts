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
import { TokenService } from '../services/token.service';

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
    private _tokenService: TokenService
  ) {
    this.clear();
  }

  logout(reload?: boolean): void {
    this._tokenService.clearToken();
    this._cookieService.deleteCookie(AppConsts.authorization.encryptedAuthTokenName);

    if (reload !== false) {
      location.href = AppConsts.appBaseUrl;
    }
  }

  authenticate(finallyCallback?: () => void): void {
    finallyCallback = finallyCallback || (() => {});

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
      this.authenticateModel.authKey == null
    ) {
      this._router.navigate(['app/two-way-auth']);
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
        this._router.navigate(['app/login']);
      }
    }
  }

  private login(
    accessToken: string,
    encryptedAccessToken: string,
    expireInSeconds: number,
    rememberMe?: boolean
  ): void {
    const tokenExpireDate = rememberMe
      ? new Date(new Date().getTime() + 1000 * expireInSeconds)
      : undefined;

    this._tokenService.setToken(accessToken, tokenExpireDate);

    this._cookieService.setCookieValue(
      AppConsts.authorization.encryptedAuthTokenName,
      encryptedAccessToken,
      tokenExpireDate
    );

    if (rememberMe) {
      this._cookieService.setCookieValue(
        'UserProfile.UsernameOrEmail',
        this._encryptionService.encrypt(
          this.authenticateModel.userNameOrEmailAddress
        ),
        new Date(new Date().getTime() + 5 * 365 * 86400000) // 5 year
      );
    } else {
      this._cookieService.deleteCookie('UserProfile.UsernameOrEmail');
    }

    location.href = AppConsts.appBaseUrl;
  }

  private clear(): void {
    this.authenticateModel = new AuthenticateModel();
    this.authenticateModel.rememberClient = false;
    this.authenticateResult = null;
    this.rememberMe = false;
  }
}
