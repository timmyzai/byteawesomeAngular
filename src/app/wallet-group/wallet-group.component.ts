import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateWalletDto, CreateWalletGroupDto, CoinDto, CoinDtoIEnumerableResponseDto, CoinServiceProxy, WalletDtoResponseDto, WalletGroupDto, WalletGroupDtoIEnumerableResponseDto, WalletGroupDtoResponseDto, WalletGroupsServiceProxy, WalletServiceProxy } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

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
  userId: string = undefined;
  selectedWalletGroupsId: string;
  selectedCoinId: string;

  constructor(
    private walletGroupServices: WalletGroupsServiceProxy,
    private walletServices: WalletServiceProxy,
    private coinServices: CoinServiceProxy,
    private errorHandler: ApiErrorHandlerService,
    private router: Router,
    private notify: NotifyServices
  ) { }

  ngOnInit(): void {
    this.getWalletGroup();
    this.getCoinList();
  }
  private async getCoinList() {
    try {
      this.isPageLoading = true;

      await this.coinServices.get().toPromise()
        .then((networkListResponseDto: CoinDtoIEnumerableResponseDto) => {
          if (networkListResponseDto.isSuccess) {
            this.coinList = networkListResponseDto.result;
            if (this.coinList.length > 0) {
              this.selectedCoinId = this.coinList[0].id;
            }
          } else {
            this.errorHandler.handleErrorResponse(networkListResponseDto, 'getWalletById Failed');
          }
        })
        .catch((error: any) => {
          this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
        });
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getWalletGroup() {
    try {
      this.isPageLoading = true;
      const userId = localStorage.getItem('loggedInUserId');

      await this.walletGroupServices.getByUserId(userId).toPromise()
        .then((walletGroupDtoListResponseDto: WalletGroupDtoIEnumerableResponseDto) => {
          if (walletGroupDtoListResponseDto.isSuccess) {
            this.walletGroups = walletGroupDtoListResponseDto.result;
            if (this.walletGroups !=null && this.walletGroups.length > 0) {
              this.selectedWalletGroupsId = this.walletGroups[0].id;
            }
          } else {
            this.errorHandler.handleErrorResponse(walletGroupDtoListResponseDto, 'getWalletById Failed');
          }
        })
        .catch((error: any) => {
          this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
        });
    } finally {
      this.isPageLoading = false;
    }
  }

  async addWalletGroup() {
    try {
      var param = new CreateWalletGroupDto();

      await this.walletGroupServices.add(param).toPromise()
      .then((walletGroupResponseDto: WalletGroupDtoResponseDto) => {
        if (walletGroupResponseDto.isSuccess) {
          this.notify.showSuccess("Add Wallet Group Successful", "Success");
        } else {
          this.errorHandler.handleErrorResponse(walletGroupResponseDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
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

      await this.walletServices.add(param).toPromise()
      .then((walletResponseDto: WalletDtoResponseDto) => {
        if (walletResponseDto.isSuccess) {
          this.notify.showSuccess("Add Wallet Successful", "Success");
        } else {
          this.errorHandler.handleErrorResponse(walletResponseDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
    } finally {
      this.getWalletGroup();
    }
  }

  async confirmUpdate(walletGroupId: string) {
    const confirmed = confirm('Please confirm to update this wallet group?');
    if (confirmed) {
      await this.updateWalletGroup(walletGroupId);
    }
  }

  async updateWalletGroup(walletGroupId: string) {
    try {
      var param = this.walletGroups.find(x => x.id == walletGroupId);
      param.isActive = !param.isActive;

      await this.walletGroupServices.update(param).toPromise()
      .then((walletGroupResponseDto: WalletGroupDtoResponseDto) => {
        if (walletGroupResponseDto.isSuccess) {
          this.notify.showSuccess("Add Wallet Group Successful", "Success");
        } else {
          this.errorHandler.handleErrorResponse(walletGroupResponseDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
    } finally {
      this.getWalletGroup();
      this.userId = undefined;
    }
  }

  async createCustoWalletGroup(walletGroupId: string) {
    try {
      var param = this.walletGroups.find(x => x.id == walletGroupId);


      await this.walletGroupServices.createCustoWalletGroup(param).toPromise()
      .then((walletGroupResponseDto: WalletGroupDtoResponseDto) => {
        if (walletGroupResponseDto.isSuccess) {
          this.notify.showSuccess("Create Custo Wallet Group Successful", "Success");
        } else {
          this.errorHandler.handleErrorResponse(walletGroupResponseDto, 'getWalletById Failed');
        }
      })
      .catch((error: any) => {
        this.errorHandler.handleCommonApiErrorReponse(error, "getWalletById Failed");;
      });
    } finally {
      this.getWalletGroup();
      this.userId = undefined;
    }
  }

  navigateToWallet(walletId: string) {
    this.router.navigate([`wallet/${walletId}`]);
  }
}
