import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { TwoFactorAuthServiceProxy, TwoFactorAuthDto, User, UserMicroServicesServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { TwoFactorAuthModalComponent } from '../two-factor-auth-modal/two-factor-auth-modal.component';
import { NotifyServices } from 'src/shared/services/notify-services';
@Component({
  selector: 'app-two-factor-auth-setup',
  templateUrl: './two-factor-auth-setup.component.html',
  styleUrls: ['./two-factor-auth-setup.component.css'],
  animations: [accountModuleAnimation()]
})
export class TwoFactorAuthSetupComponent implements OnInit {
  authDetails = new TwoFactorAuthDto();
  user: User;
  serial = '';
  isToggleTrue: boolean = false;
  isPageLoading: boolean = true;
  errorMsg: string = undefined;

  constructor(
    private twoFactorAuthService: TwoFactorAuthServiceProxy,
    private userMicroServices: UserMicroServicesServiceProxy,
    private _modalService: BsModalService,
    private _notify: NotifyServices
  ) { }

  ngOnInit(): void {
    this.getUserTwoFactorStatus();
  }

  private async getUserTwoFactorStatus(): Promise<void> {
    try {
      this.isPageLoading = true;
      const userId = 1;
      this.user = await this.userMicroServices.getUserById(userId).toPromise();
      this.isToggleTrue = this.user.isTwoFactorEnabled;
      await this.generateTwoFactorAuth();
    } finally {
      this.isPageLoading = false;
    }
  }

  async toggleTwoFactor(): Promise<void> {
    try {
      this.isPageLoading = true;
      this.isToggleTrue = !this.isToggleTrue;
      if(this.errorMsg){
        this._notify.showError(`${this.errorMsg}`, 'Generate 2FA Error', 5);
        return;
      }
      this.showTwoFactorAuthModal();
    } finally {
      this.isPageLoading = false;
    }
  }

  showTwoFactorAuthModal(): void {
    const modalRef: BsModalRef = this._modalService.show(TwoFactorAuthModalComponent);
    modalRef.content.validateTwoFactorResult.subscribe(async (bool: boolean) => {
      if (bool) {
        await this.userMicroServices.updateUser(this.isToggleTrue, this.user.id).toPromise();
        await this.generateTwoFactorAuth();
        this._notify.showSuccess('You have activated 2FA', 'Success', 5);
      } else {
        this.isToggleTrue = !this.isToggleTrue;
      }
    });
  }

  private async generateTwoFactorAuth(): Promise<void> {
    try {
      const result: TwoFactorAuthDto = await this.twoFactorAuthService.generateTwoFactorAuthentication().toPromise();
      this.authDetails = result;
      this.serial = result.twoFactorSecretKey.match(/.{4}/g).join('-');
    } catch (error) {
      this.errorMsg = error;
      this._notify.showError(`${error}`, 'Generate 2FA Error', 5);
    }
  }
}
