import { NgModule } from '@angular/core';

import * as AuthApiServiceProxies from './auth-service-proxies';
import * as UserApiServiceProxies from './user-service-proxies';
import * as WalletApiServiceProxies from './wallet-service-proxies';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './TokenInterceptor';

@NgModule({
    providers: [
        AuthApiServiceProxies.AuthenticationServiceProxy,
        AuthApiServiceProxies.TwoFactorAuthServiceProxy,
        UserApiServiceProxies.RoleServiceProxy,
        UserApiServiceProxies.UserServiceProxy,
        WalletApiServiceProxies.CoinServiceProxy,
        WalletApiServiceProxies.WalletGroupsServiceProxy,
        WalletApiServiceProxies.WalletServiceProxy,
        WalletApiServiceProxies.CustoWalletServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
