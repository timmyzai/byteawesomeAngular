import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EntityUserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { InvestmentDto, TransferDto, WalletServiceProxy, UpdateWalletDto, EntityWalletsDto, SymbolsServiceProxy, EntitySymbolsDto, UpdateWalletBalanceDto } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';
import { TwoFactorAuthModalComponent } from '../modals/two-factor-auth-modal/two-factor-auth-modal.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
})
export class WalletComponent implements OnInit {
  walletId: string;
  wallet: EntityWalletsDto;
  isPageLoading = true;
  symbolList: EntitySymbolsDto[];
  investmentAmount = 100;
  selectedInvestmentSymbol = '';
  transferAmount = 100;
  transferTarget: EntityWalletsDto[];
  selectedTransferSymbol = '';
  selectedTransferTargetWalletId: string;

  constructor(
    private walletService: WalletServiceProxy,
    private symbolService: SymbolsServiceProxy,
    private responseHandler: ApiResponseHandlerService,
    private _activatedroute: ActivatedRoute,
    private _userService: UserServiceProxy,
    private modalService: BsModalService,
    private notify: NotifyServices
  ) { }

  ngOnInit(): void {
    this._activatedroute.params.subscribe((params) => {
      this.walletId = params.id;
      this.loadWalletData();
    });
  }

  async loadWalletData(): Promise<void> {
    this.isPageLoading = true;
    try {
      const [walletResponse, symbolResponse] = await Promise.all([
        this.walletService.getWalletById(this.walletId).toPromise(),
        this.symbolService.getAllSymbols(undefined, undefined).toPromise(),
      ]);

      this.handleWalletResponse(walletResponse);
      this.handleSymbolResponse(symbolResponse);
      this.loadTransferTarget();
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'Failed to fetch data');
    } finally {
      this.isPageLoading = false;
    }
  }

  handleWalletResponse(walletDtoResponse: any): void {
    this.responseHandler.handleResponse<EntityWalletsDto>(
      walletDtoResponse,
      (data) => {
        this.wallet = data;
      },
      'Fetching wallet data failed'
    );
  }

  handleSymbolResponse(symbolResponse: any): void {
    this.responseHandler.handleResponse<EntitySymbolsDto[]>(
      symbolResponse,
      (data) => {
        this.symbolList = data.filter(x => x.symbolData.network == this.wallet.walletData.network.network);
      },
      'Fetching symbols failed'
    );
  }

  async loadTransferTarget(): Promise<void> {
    const network = this.wallet.walletData.network.network;
    const walletListResponse = await this.walletService.getAdminWalletsByNetwork(network).toPromise();
    this.handleWalletListResponse(walletListResponse);
  }

  handleWalletListResponse(walletListResponse: any): void {
    this.responseHandler.handleResponse<EntityWalletsDto[]>(
      walletListResponse,
      (data) => {
        this.transferTarget = data.filter(x => x.id != this.wallet.id);
      },
      'Fetching transfer targets failed'
    );
  }

  async disableEnableWallet(): Promise<void> {
    const action = this.wallet.walletData.isActive ? 'disable' : 'enable';
    const confirmed = confirm(`Please confirm to ${action} this wallet?`);
    if (confirmed) {
      this.wallet.walletData.isActive = !this.wallet.walletData.isActive;
      await this.updateWallet();
    }
  }

  async updateBalance(amount: number, symbolId: string) {
    var param = new UpdateWalletBalanceDto();
    param.walletsId = this.wallet.id;
    param.symbolsId = symbolId;
    param.amount = amount;

    try {
      const walletDtoResponseDto = await this.walletService.updateBalance(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletDtoResponseDto,
        () => {
          this.notify.showSuccess('Update Balance Successful', 'Success');
          this.loadWalletData();
        },
        'updateBalance Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'updateBalance Failed');
    }
  }

  async updateWallet(): Promise<void> {
    const param = new UpdateWalletDto();
    param.walletsId = this.wallet.id;
    param.isActive = this.wallet.walletData.isActive;

    try {
      const walletDtoResponseDto = await this.walletService.updateWallet(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletDtoResponseDto,
        () => {
          this.notify.showSuccess('Update Successful', 'Success');
          this.loadWalletData();
        },
        'Update wallet failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'Update wallet failed');
    }
  }

  investment(amount: number, symbolId: string): void {
    this.validateTwoFactorAndProceed(this.proceedInvestment.bind(this), amount, symbolId);
  }

  transfer(symbolId: string): void {
    this.validateTwoFactorAndProceed(this.proceedTransfer.bind(this), this.transferAmount, symbolId);
  }

  private async proceedInvestment(amount: number, symbolId: string, pin: string): Promise<void> {
    const param = new InvestmentDto();
    param.symbolsId = symbolId;
    param.amount = amount;
    param.fromWalletId = this.wallet.id;
    param.twoFactorPin = pin;

    try {
      const walletDtoResponseDto = await this.walletService.investment(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletDtoResponseDto,
        () => {
          this.notify.showSuccess('Investment Successful', 'Success');
          this.loadWalletData();
        },
        'Investment failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'Transfer Failed');
    }
  }

  private async proceedTransfer(amount: number, symbolId: string, pin: string) {
    try {
      if (!this.selectedTransferTargetWalletId) {
        this.notify.showError('Please select a transfer target', 'Failed');
        return;
      }

      const targetWallet = await this.getTargetWalletDtoResponse();

      const param = new TransferDto();
      param.symbolsId = symbolId;
      param.toWalletAddress = targetWallet.walletData.address;
      param.amount = amount;
      param.fromWalletId = this.wallet.id;
      param.twoFactorPin = pin;
      const transferResponse = await this.walletService.transfer(param).toPromise();

      this.responseHandler.handleResponse<EntityWalletsDto>(
        transferResponse,
        () => {
          this.notify.showSuccess('Transfer Successful', 'Success');
          this.loadWalletData();
        },
        'Transfer failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'Transfer Failed');
    }
  }

  private async getTargetWalletDtoResponse(): Promise<EntityWalletsDto> {
    const targetWalletDtoResponse = await this.walletService.getWalletById(this.selectedTransferTargetWalletId).toPromise();

    return new Promise<EntityWalletsDto>((resolve) => {
      this.responseHandler.handleResponse<EntityWalletsDto>(
        targetWalletDtoResponse,
        (data: EntityWalletsDto) => {
          resolve(data);
        },
        'getWalletById failed'
      );
    });
  }

  private async validateTwoFactorAndProceed(callback: (amount: number, symbolId: string, pin: string) => void, amount: number, symbolId: string): Promise<void> {
    const userId = localStorage.getItem('loggedInUserId');
    this._userService.getUserById(userId).subscribe(
      async (userResponseDto: EntityUserDtoResponseDto) => {
        const isTwoFactorEnabled = userResponseDto.result.userData.isTwoFactorEnabled;
        if (!isTwoFactorEnabled) {
          this.notify.showError('Please enable 2FA to proceed', 'Failed');
        } else {
          const modalRef = this.modalService.show(TwoFactorAuthModalComponent);

          modalRef.content.twoFactorPinResult.subscribe(async (twoFactorPin: string) => {
            if (twoFactorPin && twoFactorPin.length === 6) {
              callback(amount, symbolId, twoFactorPin);
            }
          });
        }
      }
    );
  }
}
