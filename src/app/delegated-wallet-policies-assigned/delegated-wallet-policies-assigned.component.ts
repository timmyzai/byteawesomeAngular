

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
  selector: 'app-delegated-wallet-policies-assigned',
  templateUrl: './delegated-wallet-policies-assigned.component.html',
  styleUrls: ['./delegated-wallet-policies-assigned.component.css']
})
export class DelegatedWalletPoliciesAssignedComponent implements OnInit {
  walletId: string;
  walletList: EntityWalletsDto[];
  isPageLoading = true;
  symbolList: EntitySymbolsDto[];
  createWalletPolicyInput: CreateWalletPoliciesDto = new CreateWalletPoliciesDto();
  walletPolicies: EntityWalletPolicyDto[];
  userId: string = undefined;

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
    this.loadWalletData();
  }
  async loadWalletData(): Promise<void> {
    this.isPageLoading = true;
    try {
      this.userId = localStorage.getItem('loggedInUserId');

      const walletResponse = await this.walletService.getByUserId(this.userId).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto[]>(
        walletResponse,
        (data) => {
          this.walletList = data;
        },
        'wallet getByUserId failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Failed');
    } finally {
      this.isPageLoading = false;
    }
  }
  getStatusName(enumValue: number): string {
    return EnumHelpersService.getEnumName(WalletPoliciesStatus, enumValue);
  }
}