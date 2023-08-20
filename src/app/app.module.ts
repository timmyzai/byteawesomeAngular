import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { ServiceProxyModule } from 'src/shared/service-proxies/service-proxy.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppInitializer } from 'src/app-initializer';
import { AppConsts } from 'src/shared/AppConsts';
import { USER_API_BASE_URL } from 'src/shared/service-proxies/user-service-proxies';
import { WALLET_API_BASE_URL } from 'src/shared/service-proxies/wallet-service-proxies';
import { HomeComponent } from './home/home.component';
import { TwoFactorAuthModalComponent } from './modals/two-factor-auth-modal/two-factor-auth-modal.component';

import { TwoFactorAuthSetupComponent } from './two-factor-auth/two-factor-auth-setup/two-factor-auth-setup.component';

import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { TwoFactorAuthPageComponent } from './two-factor-auth/two-factor-auth-page/two-factor-auth-page.component';
import { ToastrModule } from 'ngx-toastr';
import { WalletGroupComponent } from './wallet-group/wallet-group.component';
import { WalletComponent } from './wallet/wallet.component'
import { RegistrationComponent } from './register/register.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ConfirmationAuthPageComponent } from './confirmation-auth-page/confirmation-auth-page.component';
import { PinInputBoxModalComponent } from './modals/pin-input-box-modal/pin-input-box-modal.component';
import { DelegatedWalletPoliciesReceivedComponent } from './delegated-wallet-policies-received/delegated-wallet-policies-received.component';
import { DelegatedWalletPoliciesAssignedComponent } from './delegated-wallet-policies-assigned/delegated-wallet-policies-assigned.component';
import { WalletPolicyDetailComponent } from './wallet-policy-detail/wallet-policy-detail.component';
import { TransactionApproveRejectComponent } from './transaction-approve-reject/transaction-approve-reject.component';
import { TransactionRecordsComponent } from './transaction-records/transaction-records.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    HomeComponent,
    TwoFactorAuthModalComponent,
    PinInputBoxModalComponent,
    TwoFactorAuthSetupComponent,
    TwoFactorAuthPageComponent,
    WalletGroupComponent,
    WalletComponent,
    ForgotpasswordComponent,
    ConfirmationAuthPageComponent,
    DelegatedWalletPoliciesReceivedComponent,
    DelegatedWalletPoliciesAssignedComponent,
    WalletPolicyDetailComponent,
    TransactionApproveRejectComponent,
    TransactionRecordsComponent,
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
    AppappAuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitializer: AppInitializer) => appInitializer.init(),
      deps: [AppInitializer],
      multi: true,
    },
    { provide: USER_API_BASE_URL, useFactory: () => AppConsts.remoteUserServiceBaseUrl },
    { provide: WALLET_API_BASE_URL, useFactory: () => AppConsts.remoteWalletServiceBaseUrl },
    BsModalService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
