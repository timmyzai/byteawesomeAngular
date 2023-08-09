import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { GetTwoFactorAuthInfoResult, GetTwoFactorAuthInfoResultResponseDto, EntityUserDto, EntityUserDtoResponseDto, UserServiceProxy, EnableOrDisableTwoFactorAuthDto } from 'src/shared/service-proxies/user-service-proxies';
import { TwoFactorAuthModalComponent } from '../../modals/two-factor-auth-modal/two-factor-auth-modal.component';
import { NotifyServices } from 'src/shared/services/notify.services';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  selector: 'app-two-factor-auth-setup',
  templateUrl: './two-factor-auth-setup.component.html',
  styleUrls: ['./two-factor-auth-setup.component.css'],
  animations: [accountModuleAnimation()]
})
export class TwoFactorAuthSetupComponent implements OnInit {
  authDetails: GetTwoFactorAuthInfoResult = new GetTwoFactorAuthInfoResult();
  user: EntityUserDto;
  serial = '';
  isToggled = false;
  isPageLoading = true;
  errorMsg: string = undefined;

  constructor(
    private userService: UserServiceProxy,
    private modalService: BsModalService,
    private notify: NotifyServices,
    private responseHandler: ApiResponseHandlerService,
  ) { }

  ngOnInit(): void {
    this.getUserTwoFactorStatus();
  }

  private async getUserTwoFactorStatus(): Promise<void> {
    try {
      this.isPageLoading = true;
      const userId = localStorage.getItem('loggedInUserId');
      const userResponseDto = await this.userService.getUserById(userId).toPromise();

      if (userResponseDto.isSuccess) {
        this.user = userResponseDto.result;
        this.isToggled = this.user.userData.isTwoFactorEnabled;
        await this.createOrUpdateTwoFactorAuth(this.user);
      } else {
        this.responseHandler.handleResponse<EntityUserDto>(userResponseDto, null, 'getUserById Failed');
      }
    } catch (error: any) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'getUserById Failed');
    } finally {
      this.isPageLoading = false;
    }
  }

  async toggleTwoFactor(): Promise<void> {
    try {
      this.isPageLoading = true;
      this.isToggled = !this.isToggled;

      if (this.errorMsg) {
        this.notify.showError(`${this.errorMsg}`, 'Generate 2FA Error', 5);
        return;
      }

      this.showTwoFactorAuthModal(this.isToggled);
    } finally {
      this.isPageLoading = false;
    }
  }

  async showTwoFactorAuthModal(bool: boolean): Promise<void> {
    const modalRef = this.modalService.show(TwoFactorAuthModalComponent);

    modalRef.content.twoFactorPinResult.subscribe(async (twoFactorPin: string) => {
      if (twoFactorPin && twoFactorPin.length === 6) {
        await this.enableOrDisableTwoFactorAuth(bool, twoFactorPin);
        this.isToggled = this.user.userData.isTwoFactorEnabled;
      }
    });
  }

  private async enableOrDisableTwoFactorAuth(bool: boolean, twoFactorPin: string) {
    const param = new EnableOrDisableTwoFactorAuthDto();
    param.twoFactorPin = twoFactorPin;
    param.userId = this.user.id;
    param.enable = bool;

    try {
      const userResponseDto = await this.userService.enableOrDisableTwoFactorAuth(param).toPromise();
      this.user = userResponseDto.isSuccess ? userResponseDto.result : this.user;
    } catch (error: any) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'enableOrDisableTwoFactorAuth Failed');
    }
  }


  private async createOrUpdateTwoFactorAuth(user: EntityUserDto): Promise<void> {
    try {
      const twoFactorResponseDto = await this.userService.getTwoFactorAuthInfo(user.id).toPromise();

      if (twoFactorResponseDto.isSuccess) {
        this.authDetails = twoFactorResponseDto.result;
        this.serial = this.authDetails.twoFactorSecretKey.match(/.{4}/g).join('-');

        if (!this.isPageLoading) {
          this.notify.showSuccess(`You have ${user.userData.isTwoFactorEnabled ? 'activated' : 'deactivated'} 2FA`, 'Success', 5);
        }
      } else {
        this.responseHandler.handleResponse<GetTwoFactorAuthInfoResult>(twoFactorResponseDto, null, 'getTwoFactorAuthInfo Failed');
      }
    } catch (error: any) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'getTwoFactorAuthInfo Failed');
    }
  }

}
