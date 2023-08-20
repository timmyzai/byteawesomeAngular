
import { Component, OnInit } from '@angular/core';
import { EntitySymbolsDto, WalletPoliciesServiceProxy, CreateWalletPoliciesDto, EntityWalletPolicyDto, WalletPoliciesStatus, AgreeOrRejectWalletPolicyDto } from 'src/shared/service-proxies/wallet-service-proxies';
import { EnumHelpersService } from 'src/shared/services/EnumHelpers.service';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
    selector: 'app-delegated-wallet-policies-received',
    templateUrl: './delegated-wallet-policies-received.component.html',
    styleUrls: ['./delegated-wallet-policies-received.component.css']
})
export class DelegatedWalletPoliciesReceivedComponent implements OnInit {
    walletId: string;
    isPageLoading = true;
    symbolList: EntitySymbolsDto[];
    createWalletPolicyInput: CreateWalletPoliciesDto = new CreateWalletPoliciesDto();
    walletPoliciyList: EntityWalletPolicyDto[];
    userId: string = undefined;

    constructor(
        private responseHandler: ApiResponseHandlerService,
        private walletPolicyService: WalletPoliciesServiceProxy,
        private notify: NotifyServices,
    ) { }
    ngOnInit(): void {
        this.loadWalletData();
    }
    async loadWalletData(): Promise<void> {
        this.isPageLoading = true;
        try {
            this.userId = localStorage.getItem('loggedInUserId');

            const walletPolicyResponse = await this.walletPolicyService.getByDelegatedUserId(this.userId).toPromise();
            this.responseHandler.handleResponse<EntityWalletPolicyDto[]>(
                walletPolicyResponse,
                (data) => {
                    this.walletPoliciyList = data;
                },
                'getByDelegatedUserId failed'
            );
        }
        catch (error) {
            this.responseHandler.handleUnhandledException(error, 'Failed');
        } finally {
            this.isPageLoading = false;
        }
    }
    async agreeOrRejectWalletPolicy(isAgree: boolean, walletPolicyId: string) {
        this.isPageLoading = true;
        try {
            var param = new AgreeOrRejectWalletPolicyDto();
            param.isAgree = isAgree;
            param.walletPolicyId = walletPolicyId;
            const walletPolicyResponse = await this.walletPolicyService.agreeOrRejectWalletPolicy(param).toPromise();
            this.responseHandler.handleResponse<EntityWalletPolicyDto[]>(
                walletPolicyResponse,
                (data) => {
                    this.walletPoliciyList = data;
                    this.notify.showSuccess('agreeOrRejectWalletPolicy Successful', 'Success');
                },
                'agreeOrRejectWalletPolicy failed'
            );
        }
        catch (error) {
            this.responseHandler.handleUnhandledException(error, 'Failed');
        } finally {
            this.isPageLoading = false;
            this.loadWalletData();
        }
    }
    getStatusName(enumValue: number): string {
        return EnumHelpersService.getEnumName(WalletPoliciesStatus, enumValue);
    }
}