import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { TwoFactorAuthServiceProxy, TwoFactorAuthDto, TwoFactorAuthDtoResponseDto } from 'src/shared/service-proxies/auth-service-proxies';
import { UserDto, UserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { TwoFactorAuthModalComponent } from '../../modals/two-factor-auth-modal/two-factor-auth-modal.component';
import { NotifyServices } from 'src/shared/services/notify.services';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  selector: 'app-two-factor-auth-setup',
  templateUrl: './two-factor-auth-setup.component.html',
  styleUrls: ['./two-factor-auth-setup.component.css'],
  animations: [accountModuleAnimation()]
})
export class TwoFactorAuthSetupComponent implements OnInit {
  authDetails: TwoFactorAuthDto = new TwoFactorAuthDto();
  user: UserDto;
  serial = '';
  isToggled = false;
  isPageLoading = true;
  errorMsg: string = undefined;

  constructor(
    private twoFactorAuthService: TwoFactorAuthServiceProxy,
    private userServices: UserServiceProxy,
    private modalService: BsModalService,
    private notify: NotifyServices,
    private errorHandler: ApiErrorHandlerService,
  ) { }

  ngOnInit(): void {
    this.getUserTwoFactorStatus();
  }

  private async getUserTwoFactorStatus(): Promise<void> {
    try {
      this.isPageLoading = true;
      const userId = localStorage.getItem('loggedInUserId');

      await this.userServices.getById(userId).toPromise()
        .then((userResponseDto: UserDtoResponseDto) => {
          if (userResponseDto.isSuccess) {
            this.user = userResponseDto.result;
            this.isToggled = this.user.isTwoFactorEnabled;
          } else {
            this.errorHandler.handleErrorResponse(userResponseDto, 'getWalletById Failed');
          }
        })
        .catch((error: any) => {
          this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
        });
      await this.createOrUpdateTwoFactorAuth(this.user);
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
      this.showTwoFactorAuthModal();
    } finally {
      this.isPageLoading = false;
    }
  }

  showTwoFactorAuthModal(): void {
    const modalRef: BsModalRef = this.modalService.show(TwoFactorAuthModalComponent);
    modalRef.content.validateTwoFactorResult.subscribe(async (bool: boolean) => {
      if (bool) {
        this.user.isTwoFactorEnabled = this.isToggled;

        await this.userServices.update(this.user).toPromise()
          .then((userResponseDto: UserDtoResponseDto) => {
            if (userResponseDto.isSuccess) {
              this.user = userResponseDto.result;
            } else {
              this.errorHandler.handleErrorResponse(userResponseDto, 'getWalletById Failed');
            }
          })
          .catch((error: any) => {
            this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
          });
        await this.createOrUpdateTwoFactorAuth(this.user);
      } else {
        this.isToggled = this.user.isTwoFactorEnabled;
      }
    });
  }

  private async createOrUpdateTwoFactorAuth(user: UserDto): Promise<void> {
    await this.twoFactorAuthService.createOrUpdateTwoFactorAuth().toPromise()
      .then((twoFactorResposneDto: TwoFactorAuthDtoResponseDto) => {
        if (twoFactorResposneDto.isSuccess) {
          this.authDetails = twoFactorResposneDto.result;
          this.serial = this.authDetails.twoFactorSecretKey.match(/.{4}/g).join('-');
          if (this.isPageLoading == false) {
            this.notify.showSuccess(`You have ${user.isTwoFactorEnabled ? 'activated' : 'deactivated'} 2FA`, 'Success', 5);
          }
        } else {
          this.errorHandler.handleErrorResponse(twoFactorResposneDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
  }
}
