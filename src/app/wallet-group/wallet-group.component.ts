// wallet-group.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CreateWalletGroupsDto, CreateWalletsDto,
  EntityWalletGroupDto, EntityWalletGroupDtoIEnumerableResponseDto, EntityWalletGroupDtoResponseDto, EntityWalletsDto, EntityWalletsDtoResponseDto,
  NetworksDto, NetworksDtoPagedListResponseDto,
  NetworksServiceProxy, WalletGroupsServiceProxy, WalletServiceProxy
} from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-wallet-group',
  templateUrl: './wallet-group.component.html',
  styleUrls: ['./wallet-group.component.css']
})
export class WalletGroupComponent implements OnInit {
  walletGroups: EntityWalletGroupDto[] = [];
  networkList: NetworksDto[] = [];
  isPageLoading = true;
  errorMsg: string = undefined;
  userId: string = undefined;
  selectedWalletGroupsId: string;
  selectedNetworkId: number;

  constructor(
    private walletGroupServices: WalletGroupsServiceProxy,
    private walletService: WalletServiceProxy,
    private networkService: NetworksServiceProxy,
    private responseHandler: ApiResponseHandlerService,
    private router: Router,
    private notify: NotifyServices
  ) { }

  async ngOnInit() {
    await this.initializeData();
  }

  private async initializeData() {
    try {
      this.isPageLoading = true;
      this.userId = localStorage.getItem('loggedInUserId');
      await Promise.all([this.getWalletGroup(), this.getNetworkList()]);
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getNetworkList() {
    try {
      const networkListResponseDto = await this.networkService.getAllNetworks(undefined, undefined).toPromise();
      this.responseHandler.handleResponse<NetworksDto[]>(
        networkListResponseDto,
        data => {
          this.networkList = data;
          if (this.networkList.length > 0) {
            this.selectedNetworkId = this.networkList[0].id;
          }
        },
        'getNetworkList Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'getNetworkList Failed');
    }
  }

  private async getWalletGroup() {
    try {
      const walletGroupDtoListResponseDto = await this.walletGroupServices.getByUserId(this.userId).toPromise();
      this.responseHandler.handleResponse<EntityWalletGroupDto[]>(
        walletGroupDtoListResponseDto,
        data => {
          this.walletGroups = data;
          if (this.walletGroups.length > 0) {
            this.selectedWalletGroupsId = this.walletGroups[0].id;
          }
        },
        'getWalletGroup Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'getWalletGroup Failed');
    }
  }

  async addWalletGroup() {
    try {
      const param = new CreateWalletGroupsDto();
      param.userId = this.userId;
      const walletGroupResponseDto = await this.walletGroupServices.createWalletGroup(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletGroupDto>(
        walletGroupResponseDto,
        () => {
          this.notify.showSuccess('Add Wallet Group Successful', 'Success');
          this.getWalletGroup();
        },
        'addWalletGroup Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'addWalletGroup Failed');
    }
  }

  async addWallet() {
    try {
      const param = new CreateWalletsDto();
      param.walletGroupsId = this.selectedWalletGroupsId;
      param.networkId = this.networkList.find(x => x.id == this.selectedNetworkId)?.id;

      const walletResponseDto = await this.walletService.createWallet(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletsDto>(
        walletResponseDto,
        () => {
          this.notify.showSuccess('Add Wallet Successful', 'Success');
          this.getWalletGroup();
        },
        'addWallet Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'addWallet Failed');
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
      const param = this.walletGroups.find(x => x.id == walletGroupId);
      param.walletGroupData.isActive = !param.walletGroupData.isActive;

      const walletGroupResponseDto = await this.walletGroupServices.updateWalletGroup(param).toPromise();
      this.responseHandler.handleResponse<EntityWalletGroupDto>(
        walletGroupResponseDto,
        () => {
          this.notify.showSuccess('Update Wallet Group Successful', 'Success');
          this.getWalletGroup();
        },
        'updateWalletGroup Failed'
      );
    } catch (error) {
      this.responseHandler.handleCommonApiErrorResponse(error, 'updateWalletGroup Failed');
    }
  }

  navigateToWallet(walletId: string) {
    this.router.navigate([`wallet/${walletId}`]);
  }
}
