import { NgModule } from '@angular/core';

import * as ApiServiceProxies from './service-proxies';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './TokenInterceptor';

@NgModule({
    providers: [
        ApiServiceProxies.AuthenticationServiceProxy,
        ApiServiceProxies.TwoFactorAuthServiceProxy,
        ApiServiceProxies.UserMicroServicesServiceProxy,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ]
})
export class ServiceProxyModule { }
