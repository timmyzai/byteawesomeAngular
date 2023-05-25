import { NgModule } from '@angular/core';

import * as AuthApiServiceProxies from './auth-service-proxies';
import * as UserApiServiceProxies from './user-service-proxies';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './TokenInterceptor';

@NgModule({
    providers: [
        AuthApiServiceProxies.AuthenticationServiceProxy,
        AuthApiServiceProxies.TwoFactorAuthServiceProxy,
        UserApiServiceProxies.RolesServiceProxy,
        UserApiServiceProxies.UserServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
