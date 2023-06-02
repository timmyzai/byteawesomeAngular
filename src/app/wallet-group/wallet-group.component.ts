import { Component, OnInit } from '@angular/core';
import { CreateWalletDto, CreateWalletGroupDto, WalletDtoResponseDto, WalletGroupDto, WalletGroupDtoIEnumerableResponseDto, WalletGroupDtoResponseDto, WalletGroupsServiceProxy, WalletServiceProxy } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-wallet-group',
  templateUrl: './wallet-group.component.html',
  styleUrls: ['./wallet-group.component.css']
})
export class WalletGroupComponent implements OnInit {
  walletGroups: WalletGroupDto[];
  isPageLoading = true;
  errorMsg: string = undefined;
  userId: number = undefined;
  network: string;
  selectedWalletGroupsId: number;

  constructor(
    private walletGroupServices: WalletGroupsServiceProxy,
    private walletServices: WalletServiceProxy,
    private notify: NotifyServices,
    private errorHandler: ApiErrorHandlerService,
  ) { }

  ngOnInit(): void {
    this.getWalletGroup();
  }
  private async getWalletGroup() {
    try {
      this.isPageLoading = true;
      const userId = parseInt(localStorage.getItem('loggedInUserId'));
      const walletGroupDtoListResponseDto: WalletGroupDtoIEnumerableResponseDto = await this.walletGroupServices.getByUserId(userId).toPromise();
      this.errorHandler.handleErrorResponse(walletGroupDtoListResponseDto, 'Wallet group GetByUserId Failed');
      this.walletGroups = walletGroupDtoListResponseDto.result;
      if (this.walletGroups.length > 0) {
        this.selectedWalletGroupsId = this.walletGroups[0].id;
      }
    } finally {
      this.isPageLoading = false;
    }
  }

  async addWalletGroup() {
    try {
      var param = new CreateWalletGroupDto();
      const walletGroupResponseDto: WalletGroupDtoResponseDto = await this.walletGroupServices.add(param).toPromise();
      this.errorHandler.handleErrorResponse(walletGroupResponseDto, 'Wallet group add Failed');
    } finally {
      this.getWalletGroup();
      this.userId = undefined;
    }
  }

  async addWallet() {
    try {
      if (this.network == undefined) {
        this.errorMsg = "network is required."
        this.notify.showError(`${this.errorMsg}`, 'Add wallet Error', 5);
        return;
      }
      var param = new CreateWalletDto();
      param.walletGroupsId = this.selectedWalletGroupsId;
      param.network = this.network;
      const walletResponseDto: WalletDtoResponseDto = await this.walletServices.add(param).toPromise();
      this.errorHandler.handleErrorResponse(walletResponseDto, 'Wallet group add Failed');

    } finally {
      this.getWalletGroup();
    }
  }
}
