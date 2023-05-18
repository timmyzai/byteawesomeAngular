import { Component, OnInit } from '@angular/core';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { TwoFactorAuthServiceProxy, TwoFactorAuthDto, User, UserMicroServicesServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
  selector: 'app-two-factor-auth-setup',
  templateUrl: './two-factor-auth-setup.component.html',
  styleUrls: ['./two-factor-auth-setup.component.css'],
  animations: [accountModuleAnimation()]
})
export class TwoFactorAuthSetupComponent implements OnInit {
  saving = false;
  authDetails = new TwoFactorAuthDto();
  isTwoFactorEnabled = false;
  serial = '';
  isPageLoading = true;
  user: User;

  constructor(
    private twoFactorAuthService: TwoFactorAuthServiceProxy,
    private userMicroServices: UserMicroServicesServiceProxy
  ) { }

  ngOnInit(): void {
    this.getUserTwoFactorStatus();
  }

  private async getUserTwoFactorStatus(): Promise<void> {
    try {
      this.isPageLoading = true;
      const userId = 1;
      this.user = await this.userMicroServices.getUserById(userId).toPromise();
      this.isTwoFactorEnabled = this.user.isTwoFactorEnabled;
      await this.getTwoFactorAuthInfo();
    } finally {
      this.isPageLoading = false;
    }
  }

  async toggleTwoFactor(): Promise<void> {
    try {
      this.isPageLoading = true;
      this.isTwoFactorEnabled = !this.isTwoFactorEnabled;

      await this.userMicroServices.updateUser(this.isTwoFactorEnabled, this.user.id).toPromise();
      if (this.isTwoFactorEnabled) {
        await this.enableTwoFactorAuth();
      } else {
        await this.disableTwoFactorAuth();
      }
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getTwoFactorAuthInfo(): Promise<void> {
    const result: TwoFactorAuthDto = await this.twoFactorAuthService.getTwoFactorAuthInfo(this.user.id).toPromise();
    this.authDetails = result;
    this.serial = result.twoFactorSecretKey.match(/.{4}/g).join('-');
  } 

  private async enableTwoFactorAuth(): Promise<void> {
    const result: TwoFactorAuthDto = await this.twoFactorAuthService.enableTwoFactorAuthentication().toPromise();
    this.authDetails = result;
    this.serial = result.twoFactorSecretKey.match(/.{4}/g).join('-');
  }
  private async disableTwoFactorAuth(): Promise<void> {
    const result: TwoFactorAuthDto = await this.twoFactorAuthService.disableTwoFactorAuthentication(this.authDetails).toPromise();
    this.authDetails = result;
    this.serial = "";
  }
}
