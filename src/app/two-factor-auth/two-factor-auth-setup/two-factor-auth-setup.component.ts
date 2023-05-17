import { Component, OnInit } from '@angular/core';
import { TwoFactorAuthServiceProxy, TwoFactorsAuthDto } from 'src/shared/service-proxies/service-proxies';

@Component({
  selector: 'app-two-factor-auth-setup',
  templateUrl: './two-factor-auth-setup.component.html',
  styleUrls: ['./two-factor-auth-setup.component.css']
})
export class TwoFactorAuthSetupComponent implements OnInit{

  constructor(
    private _twoFactorAuthService: TwoFactorAuthServiceProxy,
  ) {
  }
  saving = false;
  authDetails = new TwoFactorsAuthDto();
  isTwoFactorEnableValue: boolean = undefined;
  shownLoginName = '';
  serial = '';
  isPageLoading: boolean = false;
  userId: number = 123;

  ngOnInit(): void {
    this.isPageLoading = true;
  }

  Enable(): void {
    this._twoFactorAuthService.enableTwoFactorAuthentication(this.userId).subscribe(
      (result: TwoFactorsAuthDto) => {
        this.authDetails = result;
        var secretKey = result.twoFactorSecretKey;
        this.shownLoginName = result.userName;
        this.serial = secretKey.substring(0,4) + "-" + secretKey.substring(4,8) + "-" + secretKey.substring(8,12) + "-" + secretKey.substring(12,16);
      }
    )
  }
  Disable(): void {
  }
}
