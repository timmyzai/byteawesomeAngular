import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletDto, WalletDtoResponseDto, WalletServiceProxy } from 'src/shared/service-proxies/wallet-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  walletId: number;
  wallet: WalletDto;
  isPageLoading = true;
  errorMsg: string = undefined;
  coin: string;


  constructor(
    private walletServices: WalletServiceProxy,
    private errorHandler: ApiErrorHandlerService,
    private _activatedroute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this._activatedroute.params.subscribe(params => {
      this.walletId = parseInt(params.id);
      this.getWalletById(this.walletId);
    });
  }

  private async getWalletById(walletId: number) {
    try {
      this.isPageLoading = true;
      const walletDtoResponseDto: WalletDtoResponseDto = await this.walletServices.getById(walletId).toPromise();
      this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'Wallet GetById Failed');
      this.wallet = walletDtoResponseDto.result;
    } finally {
      this.isPageLoading = false;
    }
  }

  async confirmUpdate() {
    const confirmed = confirm('Please confirm to update this wallet?');
    if (confirmed) {
      await this.updateWalletGroup(this.wallet);
    }
  }

  async updateWalletGroup(wallet: WalletDto) {
    try {
      var param = wallet;
      param.isActive = !param.isActive;
      const walletDtoResponseDto: WalletDtoResponseDto = await this.walletServices.update(param).toPromise();
      this.errorHandler.handleErrorResponse(walletDtoResponseDto, 'Wallet update Failed');
    } finally {
      this.getWalletById(this.walletId);
    }
  }

}
