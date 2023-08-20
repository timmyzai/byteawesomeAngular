

import { Component, OnInit } from '@angular/core';
import { TransactionsServiceProxy, EntityTransactionsDto, ApproveOrRejectTransactionDto, TransferStatus } from 'src/shared/service-proxies/wallet-service-proxies';
import { EnumHelpersService } from 'src/shared/services/EnumHelpers.service';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-transaction-approve-reject',
  templateUrl: './transaction-approve-reject.component.html',
  styleUrls: ['./transaction-approve-reject.component.css']
})
export class TransactionApproveRejectComponent implements OnInit {
  walletId: string;
  isPageLoading = true;
  transactionList: EntityTransactionsDto[];
  userId: string = undefined;

  constructor(
    private responseHandler: ApiResponseHandlerService,
    private transactionService: TransactionsServiceProxy,
    private notify: NotifyServices,
  ) { }
  ngOnInit(): void {
    this.loadTransactionData();
  }
  async loadTransactionData(): Promise<void> {
    this.isPageLoading = true;
    try {
      this.userId = localStorage.getItem('loggedInUserId');

      const transactionResponse = await this.transactionService.getAllPendingTransaction(this.userId).toPromise();
      this.responseHandler.handleResponse<EntityTransactionsDto[]>(
        transactionResponse,
        (data) => {
          this.transactionList = data;
        },
        'getAllPendingTransaction failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Failed');
    } finally {
      this.isPageLoading = false;
    }
  }
  async approveOrRejectTransaction(isApprove: boolean, transactionId: string) {
    this.isPageLoading = true;
    try {
      var param = new ApproveOrRejectTransactionDto();
      param.approve = isApprove;
      param.transactionId = transactionId;
      const transactionResponse = await this.transactionService.approveOrRejectTransaction(param).toPromise();
      this.responseHandler.handleResponse<EntityTransactionsDto[]>(
        transactionResponse,
        (data) => {
          this.transactionList = data;
          this.notify.showSuccess('agreeOrRejectWalletPolicy Successful', 'Success');
        },
        'approveOrRejectTransaction failed'
      );
    }
    catch (error) {
      this.responseHandler.handleUnhandledException(error, 'Failed');
    } finally {
      this.isPageLoading = false;
      this.loadTransactionData();
    }
  }
  getStatusName(enumValue: number): string {
    return EnumHelpersService.getEnumName(TransferStatus, enumValue);
  }
}