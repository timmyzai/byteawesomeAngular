import { NgModule } from '@angular/core';

import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.AuthenticationServiceProxy,
    ]
})
export class ServiceProxyModule { }
