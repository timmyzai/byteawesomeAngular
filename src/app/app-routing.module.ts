import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { TwoFactorAuthSetupComponent } from './two-factor-auth/two-factor-auth-setup/two-factor-auth-setup.component';
import { SecretPlaceComponent } from './secret-place/secret-place.component';
import { TwoFactorAuthPageComponent } from './two-factor-auth/two-factor-auth-page/two-factor-auth-page.component';
import { WalletGroupComponent } from './wallet-group/wallet-group.component';
import { WalletComponent } from './wallet/wallet.component';
import { RegistrationComponent } from './register/register.component';
import { ConfirmationAuthPageComponent } from './confirmation-auth-page/confirmation-auth-page.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'two-factor-auth-setup', component: TwoFactorAuthSetupComponent },
  { path: 'two-factor-auth-page', component: TwoFactorAuthPageComponent },
  { path: 'confirmation-auth-page', component: ConfirmationAuthPageComponent },
  { path: 'forgotpassword-page', component: ForgotpasswordComponent },
  { path: 'secret-place', component: SecretPlaceComponent },
  { path: 'wallet-group', component: WalletGroupComponent },
  { path: 'wallet/:id', component: WalletComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


