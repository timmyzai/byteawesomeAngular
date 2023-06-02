import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppInitializer } from 'src/app-initializer';
import { AppConsts } from 'src/shared/AppConsts';
import { AUTH_API_BASE_URL } from 'src/shared/service-proxies/auth-service-proxies';
import { USER_API_BASE_URL } from 'src/shared/service-proxies/user-service-proxies';
import { WALLET_API_BASE_URL } from 'src/shared/service-proxies/wallet-service-proxies';
import { HomeComponent } from './home/home.component';
import { TwoFactorAuthModalComponent } from './two-factor-auth/two-factor-auth-modal/two-factor-auth-modal.component';
import { SecretPlaceComponent } from './secret-place/secret-place.component';
import { TwoFactorAuthSetupComponent } from './two-factor-auth/two-factor-auth-setup/two-factor-auth-setup.component';

import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { TwoFactorAuthPageComponent } from './two-factor-auth/two-factor-auth-page/two-factor-auth-page.component';
import { ToastrModule } from 'ngx-toastr';
import { WalletGroupComponent } from './wallet-group/wallet-group.component';
import { WalletComponent } from './wallet/wallet.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    TwoFactorAuthModalComponent,
    SecretPlaceComponent,
    TwoFactorAuthSetupComponent,
    TwoFactorAuthPageComponent,
    WalletGroupComponent,
    WalletComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ServiceProxyModule,
    HttpClientModule,
    ModalModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      closeButton: true,
    })
  ],
  providers: [
    AppAuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitializer: AppInitializer) => appInitializer.init(),
      deps: [AppInitializer],
      multi: true,
    },
    { provide: AUTH_API_BASE_URL, useFactory: () => AppConsts.remoteAuthServiceBaseUrl },
    { provide: USER_API_BASE_URL, useFactory: () => AppConsts.remoteUserServiceBaseUrl },
    { provide: WALLET_API_BASE_URL, useFactory: () => AppConsts.remoteWalletServiceBaseUrl },
    BsModalService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
