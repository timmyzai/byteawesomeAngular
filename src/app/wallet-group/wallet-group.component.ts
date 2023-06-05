import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateWalletDto, CreateWalletGroupDto, CoinDto, CoinDtoIEnumerableResponseDto, CoinServiceProxy, WalletDtoResponseDto, WalletGroupDto, WalletGroupDtoIEnumerableResponseDto, WalletGroupDtoResponseDto, WalletGroupsServiceProxy, WalletServiceProxy } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  selector: 'app-wallet-group',
  templateUrl: './wallet-group.component.html',
  styleUrls: ['./wallet-group.component.css']
})
export class WalletGroupComponent implements OnInit {
  walletGroups: WalletGroupDto[];
  coinList: CoinDto[];
  isPageLoading = true;
  errorMsg: string = undefined;
  userId: number = undefined;
  selectedWalletGroupsId: number;
  selectedCoinId: number;

  constructor(
    private walletGroupServices: WalletGroupsServiceProxy,
    private walletServices: WalletServiceProxy,
    private coinServices: CoinServiceProxy,
    private errorHandler: ApiErrorHandlerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getWalletGroup();
    this.getCoinList();
  }
  private async getCoinList() {
    try {
      this.isPageLoading = true;
      const netowrkListResponseDto: CoinDtoIEnumerableResponseDto = await this.coinServices.get().toPromise();
      this.errorHandler.handleErrorResponse(netowrkListResponseDto, 'Wallet group GetByUserId Failed');
      this.coinList = netowrkListResponseDto.result;
      if (this.coinList.length > 0) {
        this.selectedCoinId = this.coinList[0].id;
      }
    } finally {
      this.isPageLoading = false;
    }
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
      var param = new CreateWalletDto();
      param.walletGroupsId = this.selectedWalletGroupsId;
      param.coin = this.coinList.find(x => x.id == this.selectedCoinId);
      const walletResponseDto: WalletDtoResponseDto = await this.walletServices.add(param).toPromise();
      this.errorHandler.handleErrorResponse(walletResponseDto, 'Wallet add Failed');
    } finally {
      this.getWalletGroup();
    }
  }

  async confirmUpdate(walletGroupId: number) {
    const confirmed = confirm('Please confirm to update this wallet group?');
    if (confirmed) {
      await this.updateWalletGroup(walletGroupId);
    }
  }

  async updateWalletGroup(walletGroupId: number) {
    try {
      var param = this.walletGroups.find(x => x.id == walletGroupId);
      param.isActive = !param.isActive;
      const walletGroupResponseDto: WalletGroupDtoResponseDto = await this.walletGroupServices.update(param).toPromise();
      this.errorHandler.handleErrorResponse(walletGroupResponseDto, 'Wallet group update Failed');
    } finally {
      this.getWalletGroup();
      this.userId = undefined;
    }
  }

  navigateToWallet(walletId: number) {
    this.router.navigate([`wallet/${walletId}`]);
  }
}
