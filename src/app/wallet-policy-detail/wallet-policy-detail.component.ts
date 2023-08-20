import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { InvestmentDto, TransferDto, WalletServiceProxy, EntityWalletsDto, SymbolsServiceProxy, EntitySymbolsDto, WalletPoliciesServiceProxy, WhitelistAddressesDto, TransferLimitsDto, EntityWalletPolicyDto, TransferRulesDto } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-wallet-policy-detail',
  templateUrl: './wallet-policy-detail.component.html',
  styleUrls: ['./wallet-policy-detail.component.css']
})
export class WalletPolicyDetailComponent implements OnInit {
  walletPolicyId: string;
  walletPolicy: EntityWalletPolicyDto;
  isPageLoading = true;
  symbolList: EntitySymbolsDto[];
  InvestmentDtoInput = new InvestmentDto();
  TransferDtoInput = new TransferDto();
  wallet: EntityWalletsDto;

  constructor(
    private walletService: WalletServiceProxy,
    private symbolService: SymbolsServiceProxy,
    private responseHandler: ApiResponseHandlerService,
    private _activatedroute: ActivatedRoute,
    private notify: NotifyServices,
    private walletPolicyService: WalletPoliciesServiceProxy
  ) { }

  ngOnInit(): void {
    this._activatedroute.params.subscribe((params) => {
      this.walletPolicyId = params.id;
      this.loadWalletPolicyData();
    });
  }
  async loadWalletPolicyData(): Promise<void> {
    this.isPageLoading = true;
    try {
      const walletPolicyResponse = await this.walletPolicyService.getWalletPolicyById(this.walletPolicyId).toPromise();

      this.responseHandler.handleResponse<EntityWalletPolicyDto>(
        walletPolicyResponse,
        (data) => {
          this.walletPolicy = data;
        },
        'getWalletPolicyById failed'
      );

      const [walletResponse, symbolResponse] = await Promise.all([
        this.walletService.getWalletById(this.walletPolicy.walletPoliciesData.walletsId).toPromise(),
        this.symbolService.getAllSymbols(undefined, undefined).toPromise(),
      ]);

      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletResponse,
        (data) => {
          this.wallet = data;
        },
        'getWalletById failed'
      );
      this.responseHandler.handleResponse<EntitySymbolsDto[]>(
        symbolResponse,
        (data) => {
          this.symbolList = data.filter(x => x.symbolData.network == this.wallet.walletData.network.network);
        },
        'getAllSymbols failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Failed');
    } finally {
      this.isPageLoading = false;
    }
  }

  async SubmitEditWalletPolicy() {
    try {
      var param = this.walletPolicy;
      if (param.walletPoliciesData.transferRules && param.walletPoliciesData.transferRules.transferLimits != undefined) {
        param.walletPoliciesData.transferRules.transferLimits.forEach(x => {
          x.dayLimit = x.dayLimit == null ? 0 : x.dayLimit;
          x.weekLimit = x.weekLimit == null ? 0 : x.weekLimit;
          x.monthLimit = x.monthLimit == null ? 0 : x.monthLimit;
          x.yearLimit = x.yearLimit == null ? 0 : x.yearLimit;
        });
      }
      var walletPolicyResponseDto = await this.walletPolicyService.updateWalletPolicy(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletPolicyDto>(
        walletPolicyResponseDto,
        () => {
          this.notify.showSuccess('updateWalletPolicy Successful', 'Success');
        },
        'updateWalletPolicy failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'updateWalletPolicy Failed');
    } finally {
      this.resetFormAndReloadData();
    }
  }

  private resetFormAndReloadData(): void {
    this.InvestmentDtoInput = new InvestmentDto();
    this.TransferDtoInput = new TransferDto();
    this.loadWalletPolicyData();
  }
  updateTransferApproval(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (this.walletPolicy.walletPoliciesData.transferRules == undefined) {
      this.walletPolicy.walletPoliciesData.transferRules = new TransferRulesDto();
    }
    this.walletPolicy.walletPoliciesData.transferRules.isTransferApprovalNeeded = checkbox.checked;
  }
  addTransferLimit() {
    if (this.walletPolicy.walletPoliciesData.transferRules == undefined) {
      this.walletPolicy.walletPoliciesData.transferRules = new TransferRulesDto();
    }
    if (this.walletPolicy.walletPoliciesData.transferRules.transferLimits == undefined) {
      this.walletPolicy.walletPoliciesData.transferRules.transferLimits = []
    }
    this.walletPolicy.walletPoliciesData.transferRules.transferLimits.push(new TransferLimitsDto());
  }
  addWhitelistAddress() {
    if (this.walletPolicy.walletPoliciesData.transferRules == undefined) {
      this.walletPolicy.walletPoliciesData.transferRules = new TransferRulesDto();
    }
    if (this.walletPolicy.walletPoliciesData.transferRules.whitelistAddresses == undefined) {
      this.walletPolicy.walletPoliciesData.transferRules.whitelistAddresses = [];
    }
    this.walletPolicy.walletPoliciesData.transferRules.whitelistAddresses.push(new WhitelistAddressesDto());
  }
  deleteTransferLimit(index: number) {
    if (this.walletPolicy.walletPoliciesData.transferRules?.transferLimits) {
      this.walletPolicy.walletPoliciesData.transferRules.transferLimits.splice(index, 1);
    }
  }
  deleteWhitelistAddress(index: number) {
    if (this.walletPolicy.walletPoliciesData.transferRules?.whitelistAddresses) {
      this.walletPolicy.walletPoliciesData.transferRules.whitelistAddresses.splice(index, 1);
    }
  }

  formatDateForInput(date: Date): string {
    try {
      return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US');
    } catch (error) {
      return null;
    }
  }
}
