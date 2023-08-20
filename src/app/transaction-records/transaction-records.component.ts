import { Component, OnInit } from '@angular/core';
import { TransactionsServiceProxy, EntityTransactionsDto, ApproveOrRejectTransactionDto, TransferStatus } from 'src/shared/service-proxies/wallet-service-proxies';
import { EnumHelpersService } from 'src/shared/services/EnumHelpers.service';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';


@Component({
  selector: 'app-transaction-records',
  templateUrl: './transaction-records.component.html',
  styleUrls: ['./transaction-records.component.css']
})
export class TransactionRecordsComponent implements OnInit {
  walletId: string;
  isPageLoading = true;
  transactionList: EntityTransactionsDto[];
  userId: string = undefined;

  constructor(
    private responseHandler: ApiResponseHandlerService,
    private transactionService: TransactionsServiceProxy
  ) { }
  ngOnInit(): void {
    this.loadTransactionData();
  }
  async loadTransactionData(): Promise<void> {
    this.isPageLoading = true;
    try {
      this.userId = localStorage.getItem('loggedInUserId');

      const transactionResponse = await this.transactionService.getMyTransactionRecords(this.userId).toPromise();
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

  getStatusName(enumValue: number): string {
    return EnumHelpersService.getEnumName(TransferStatus, enumValue);
  }
}