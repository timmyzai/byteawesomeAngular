import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { InvestmentDto, TransferDto, UpdateWalletBalanceDto, WalletDto, WalletDtoIEnumerableResponseDto, WalletDtoResponseDto, WalletServiceProxy } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';
import { PinInputBoxModalComponent } from '../modals/pin-input-box-modal/pin-input-box-modal.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  walletId: string;
  wallet: WalletDto;
  isPageLoading = true;
  errorMsg: string = undefined;
  coin: string;
  transferAmount: number = 100;
  transferTarget: WalletDto[];
  selectedTransferTargetWalletId: string;

  constructor(
    private walletServices: WalletServiceProxy,
    private errorHandler: ApiErrorHandlerService,
    private _activatedroute: ActivatedRoute,
    private _userService: UserServiceProxy,
    private _modalService: BsModalService,
    private notify: NotifyServices
  ) { }
  ngOnInit(): void {
    this._activatedroute.params.subscribe(params => {
      this.walletId = params.id;
      this.getWalletById(this.walletId);
    });
  }
  private async getWalletById(walletId: string) {
    this.isPageLoading = true;


    await this.walletServices.getById(walletId).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          this.wallet = walletDtoResponseDto.result;
          this.LoadTransferTarget();
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
    this.isPageLoading = false;
  }

  async disableEnableWallet() {
    const confirmed = confirm(`Please confirm to ${this.wallet.isActive ? "disable" : "enable"} this wallet?`);
    if (confirmed) {
      this.wallet.isActive = !this.wallet.isActive;
      await this.updateWallet(this.wallet);;
    }
  }
  async updateBalance(amount: number) {
    var param = new UpdateWalletBalanceDto();
    param.id = this.wallet.id
    param.userId = this.wallet.userId
    param.walletGroupsId = this.wallet.walletGroupsId
    param.address = this.wallet.address
    param.coin = this.wallet.coin
    param.balance = this.wallet.balance
    param.isActive = this.wallet.isActive
    param.isCustoWalletCreated = this.wallet.isCustoWalletCreated
    param.amount = amount

    await this.walletServices.updateBalance(param).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          this.notify.showSuccess("Update Balance Successful", "Success");
          this.getWalletById(this.walletId);
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'updateBalance Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "updateBalance Failed");;
      });
  }

  async updateWallet(wallet: WalletDto) {
    await this.walletServices.update(wallet).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          this.notify.showSuccess("Update Successful", "Success");
          this.getWalletById(this.walletId);
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'updateWallet Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "updateWallet Failed");;
      });
  }
  investment(amount: number): void {
    const userId = localStorage.getItem('loggedInUserId');
    this._userService.getById(userId).subscribe(
      (userResponseDto: UserDtoResponseDto) => {
        const isTwoFactorEnabled = userResponseDto.result.isTwoFactorEnabled;

        if (!isTwoFactorEnabled) {
          this.notify.showError("Please enable 2FA to proceed", "Failed");
        } else {
          this.showPinInputBoxModal().then((pin: string) => {
            this.proceedInvestment(amount, pin);
          });
        }
      }
    );
  }

  private async proceedInvestment(amount: number, pin: string) {
    var param = new InvestmentDto();
    param.amount = amount;
    param.fromWalletId = this.wallet.id;
    param.twoFactorPin = pin;
    await this.walletServices.investment(param).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          this.notify.showSuccess("Investment Successful", "Success");

          this.getWalletById(this.walletId);
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'Investment Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "proceedInvestment Failed");;
      });
  }
  transfer(): void {
    const userId = localStorage.getItem('loggedInUserId');
    this._userService.getById(userId).subscribe(
      (userResponseDto: UserDtoResponseDto) => {
        const isTwoFactorEnabled = userResponseDto.result.isTwoFactorEnabled;

        if (!isTwoFactorEnabled) {
          this.notify.showError("Please enable 2FA to proceed", "Failed");
        } else {
          this.showPinInputBoxModal().then((pin: string) => {
            this.proceedTransfer(this.transferAmount, pin);
          });
        }
      }
    );
  }

  private async proceedTransfer(amount: number, pin: string) {
    var param = new TransferDto();
    param.amount = amount;
    param.fromWalletId = this.wallet.id;
    param.twoFactorPin = pin;
    if (this.selectedTransferTargetWalletId == null) {
      this.notify.showError("Please select a transfer target", "Failed");
    }

    await this.walletServices.getById(this.selectedTransferTargetWalletId).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          param.toWalletId = walletDtoResponseDto.result.id;
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'Transfer Failed');
          return;
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "Transfer Failed");;
      });

    await this.walletServices.transfer(param).toPromise()
      .then((walletDtoResponseDto: WalletDtoResponseDto) => {
        if (walletDtoResponseDto.isSuccess) {
          this.notify.showSuccess("Transfer Successful", "Success");
          this.getWalletById(this.walletId);
        } else {
          this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'Transfer Failed');
          return;
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "Transfer Failed");;
      });
  }

  showPinInputBoxModal(): Promise<string> {
    return new Promise<string>((resolve) => {
      const modalRef: BsModalRef = this._modalService.show(PinInputBoxModalComponent);
      modalRef.content.pinInputResult.subscribe((pin: string) => {
        resolve(pin);
      });
    });
  }

  async LoadTransferTarget() {
    await this.walletServices.getAdminWalletsForCoinId(this.wallet.coin.id).toPromise()
      .then((walletListResponseDto: WalletDtoIEnumerableResponseDto) => {
        if (walletListResponseDto.isSuccess) {
          this.transferTarget = walletListResponseDto.result;
        } else {
          this.errorHandler.handleErrorResponse(walletListResponseDto, 'getAdminWalletGroup Failed');
          return;
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getAdminWalletGroup Failed");;
      });
  }
}
