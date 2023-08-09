import { NgModule } from '@angular/core';

import * as UserApiServiceProxies from './user-service-proxies';
import * as WalletApiServiceProxies from './wallet-service-proxies';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './TokenInterceptor';

@NgModule({
    providers: [
        UserApiServiceProxies.UserServiceProxy,
        WalletApiServiceProxies.SymbolsServiceProxy,
        WalletApiServiceProxies.NetworksServiceProxy,
        WalletApiServiceProxies.WalletGroupsServiceProxy,
        WalletApiServiceProxies.WalletServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
