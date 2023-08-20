import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EntityUserDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { InvestmentDto, TransferDto, WalletServiceProxy, UpdateWalletDto, EntityWalletsDto, SymbolsServiceProxy, EntitySymbolsDto, UpdateWalletBalanceDto, WalletPoliciesServiceProxy, CreateWalletPoliciesDto, WhitelistAddressesDto, TransferLimitsDto, EntityWalletPolicyDto, TransferRulesDto, WalletPoliciesStatus } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';
import { TwoFactorAuthModalComponent } from '../modals/two-factor-auth-modal/two-factor-auth-modal.component';
import { EnumHelpersService } from 'src/shared/services/EnumHelpers.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
})
export class WalletComponent implements OnInit {
  userId: string;
  walletId: string;
  wallet: EntityWalletsDto;
  isPageLoading = true;
  symbolList: EntitySymbolsDto[];
  createWalletPolicyInput: CreateWalletPoliciesDto = new CreateWalletPoliciesDto();
  InvestmentDtoInput = new InvestmentDto();
  TransferDtoInput = new TransferDto();

  constructor(
    private walletService: WalletServiceProxy,
    private symbolService: SymbolsServiceProxy,
    private responseHandler: ApiResponseHandlerService,
    private _activatedroute: ActivatedRoute,
    private _userService: UserServiceProxy,
    private modalService: BsModalService,
    private notify: NotifyServices,
    private walletPolicyService: WalletPoliciesServiceProxy
  ) { }
  ngOnInit(): void {
    this.userId = localStorage.getItem('loggedInUserId');

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

      await this.responseHandler.handleResponse<EntityWalletsDto>(
        walletResponse,
        (data) => {
          this.wallet = data;
        },
        'getWalletById failed'
      );
      await this.responseHandler.handleResponse<EntitySymbolsDto[]>(
        symbolResponse,
        (data) => {
          this.symbolList = data.filter(x => x.symbolData.network == this.wallet.walletData.network.network);
        },
        'getAllSymbols failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Failed to fetch data');
    } finally {
      this.isPageLoading = false;
    }
  }
  async disableEnableWallet(): Promise<void> {
    const action = this.wallet.walletData.isActive ? 'disable' : 'enable';
    const confirmed = confirm(`Please confirm to ${action} this wallet?`);
    if (confirmed) {
      this.wallet.walletData.isActive = !this.wallet.walletData.isActive;
      const param = new UpdateWalletDto();
      param.walletsId = this.wallet.id;
      param.isActive = this.wallet.walletData.isActive;

      try {
        const walletDtoResponseDto = await this.walletService.updateWallet(param).toPromise();
        this.responseHandler.handleResponse<EntityWalletsDto>(
          walletDtoResponseDto,
          () => {
            this.notify.showSuccess('Update Successful', 'Success');
          },
          'Update wallet failed'
        );
      }
      catch (error) {
        this.responseHandler.handleUnhandledException(error, 'Update wallet failed');
      } finally {
        this.resetFormAndReloadData();
      }
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
        },
        'updateBalance Failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'updateBalance Failed');
    } finally {
      this.resetFormAndReloadData();
    }
  }
  addTransferLimit() {
    if (this.createWalletPolicyInput.transferRules == undefined) {
      this.createWalletPolicyInput.transferRules = new TransferRulesDto();
    }
    if (this.createWalletPolicyInput.transferRules.transferLimits == undefined) {
      this.createWalletPolicyInput.transferRules.transferLimits = []
    }
    this.createWalletPolicyInput.transferRules.transferLimits.push(new TransferLimitsDto());
  }
  addWhitelistAddress() {
    if (this.createWalletPolicyInput.transferRules == undefined) {
      this.createWalletPolicyInput.transferRules = new TransferRulesDto();
    }
    if (this.createWalletPolicyInput.transferRules.whitelistAddresses == undefined) {
      this.createWalletPolicyInput.transferRules.whitelistAddresses = [];
    }
    this.createWalletPolicyInput.transferRules.whitelistAddresses.push(new WhitelistAddressesDto());
  }
  deleteTransferLimit(index: number) {
    if (this.createWalletPolicyInput.transferRules?.transferLimits) {
      this.createWalletPolicyInput.transferRules.transferLimits.splice(index, 1);
    }
  }
  deleteWhitelistAddress(index: number) {
    if (this.createWalletPolicyInput.transferRules?.whitelistAddresses) {
      this.createWalletPolicyInput.transferRules.whitelistAddresses.splice(index, 1);
    }
  }
  updateTransferApproval(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (this.createWalletPolicyInput.transferRules == undefined) {
      this.createWalletPolicyInput.transferRules = new TransferRulesDto();
    }
    this.createWalletPolicyInput.transferRules.isTransferApprovalNeeded = checkbox.checked;
  }
  SubmitInvestment(): void {
    this.validateTwoFactorAndProceed(this.proceedInvestment.bind(this));
  }
  SubmitTransfer(): void {
    this.validateTwoFactorAndProceed(this.proceedTransfer.bind(this));
  }
  async SubmitCreateWalletPolicy() {
    try {
      var param = this.createWalletPolicyInput;
      if (param.delegateUserId == null) {
        this.notify.showError('Please select a delegate user', 'Failed');
      }
      param.walletsId = this.wallet.id;
      if (param.walletsId == null) {
        this.notify.showError('Please select a wallet', 'Failed');
      }
      if (param.transferRules && param.transferRules.transferLimits != undefined) {
        param.transferRules.transferLimits.forEach(x => {
          x.dayLimit = x.dayLimit == null ? 0 : x.dayLimit;
          x.weekLimit = x.weekLimit == null ? 0 : x.weekLimit;
          x.monthLimit = x.monthLimit == null ? 0 : x.monthLimit;
          x.yearLimit = x.yearLimit == null ? 0 : x.yearLimit;
        });
      }
      var walletPolicyResponseDto = await this.walletPolicyService.createWalletPolicy(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletPolicyDto>(
        walletPolicyResponseDto,
        () => {
          this.notify.showSuccess('createWalletPolicy Successful', 'Success');
        },
        'createWalletPolicy failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'createWalletPolicy Failed');
    } finally {
      this.resetFormAndReloadData();
    }
  }
  private resetFormAndReloadData(): void {
    this.createWalletPolicyInput = new CreateWalletPoliciesDto();
    this.InvestmentDtoInput = new InvestmentDto();
    this.TransferDtoInput = new TransferDto();
    this.loadWalletData();
  }
  private async proceedInvestment(pin: string): Promise<void> {
    const param = this.InvestmentDtoInput;
    param.fromWalletId = this.wallet.id;
    param.twoFactorPin = pin;

    try {
      const walletDtoResponseDto = await this.walletService.investment(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletDtoResponseDto,
        () => {
          this.notify.showSuccess('Investment Successful', 'Success');
        },
        'Investment failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Transfer Failed');
    } finally {
      this.resetFormAndReloadData();
    }
  }
  private async proceedTransfer(pin: string) {
    try {
      if (this.TransferDtoInput.toWalletAddress == '') {
        this.notify.showError('Please key in a transfer target address', 'Failed');
        return;
      }
      const param = this.TransferDtoInput;
      param.fromWalletId = this.wallet.id;
      param.twoFactorPin = pin;
      const transferResponse = await this.walletService.transfer(param).toPromise();

      this.responseHandler.handleResponse<EntityWalletsDto>(
        transferResponse,
        () => {
          this.notify.showSuccess('Transfer Successful', 'Success');
        },
        'Transfer failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Transfer Failed');
    } finally {
      this.resetFormAndReloadData();
    }
  }
  private async validateTwoFactorAndProceed(callback: (pin: string) => void): Promise<void> {
    try {
      const userResponseDto = await this._userService.getUserById(this.userId).toPromise();
      var user = await this.responseHandler.handleResponse<EntityUserDto>(
        userResponseDto,
        (data) => data,
        'getUserById failed'
      );
      if (!user || !user.userData) return;
      const isTwoFactorEnabled = user.userData.isTwoFactorEnabled;
      if (!isTwoFactorEnabled) {
        this.notify.showError('Please enable 2FA to proceed', 'Failed');
        return;
      }
      const twoFactorPin = await this.getTwoFactorPin();
      callback(twoFactorPin);
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'validateTwoFactorAndProceed Failed');
    }
  }
  private async getTwoFactorPin(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const modalRef = this.modalService.show(TwoFactorAuthModalComponent);
      modalRef.content.twoFactorPinResult.subscribe((pin: string) => {
        if (pin && pin.length === 6) {
          resolve(pin);
        } else {
          reject(new Error('Invalid 2FA pin'));
        }
      });
    });
  }

  getStatusName(enumValue: number): string {
    return EnumHelpersService.getEnumName(WalletPoliciesStatus, enumValue);
  }
}