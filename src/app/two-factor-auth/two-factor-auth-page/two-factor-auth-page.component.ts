import { Component, EventEmitter, } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { TwoFactorAuthServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
  selector: 'app-two-factor-auth-page',
  templateUrl: './two-factor-auth-page.component.html',
  styleUrls: ['./two-factor-auth-page.component.css'],
  animations: [accountModuleAnimation()]

})

export class TwoFactorAuthPageComponent {
  isLoading: Boolean;
  otpLength: number = 6;
  otpBoxes: string[] = Array(this.otpLength).fill('');
  isValidInput: Boolean = false;
  isInvalidPin: Boolean = false;
  validateTwoFactorResult: EventEmitter<boolean> = new EventEmitter<boolean>();
  submitting: boolean;

  constructor(
    private _twoFactorAuthService: TwoFactorAuthServiceProxy,
    private route: Router,
    public authService: AppAuthService,
  ) {
  }

  onOtpChange(event: any): void {
    const otp = event.target.value;
    if (otp && isNaN(otp)) {
      event.target.value = otp.slice(0, -1);
      return;
    }

    this.otpBoxes = Array(this.otpLength).fill('');
    for (let i = 0; i < otp.length; i++) {
      this.otpBoxes[i] = otp[i];
    }
    this.isInvalidPin = false;
    this.isValidInput = otp.length === this.otpLength;
  }

  submit() {
    const userId = 1;
    const twoFactorPin = this.otpBoxes.join('');
    this._twoFactorAuthService.validateTwoFactorPIN(userId, twoFactorPin).subscribe(
      (bool) => {
        if (bool) {
          this.login(twoFactorPin);
        } else {
          this.isInvalidPin = true;
        }
      }
    )
  }
  back() {
    this.route.navigate(["login"]);
  }

  login(twoFactorPin: string): void {
    this.submitting = true;
    this.authService.authenticateModel.twoFactorPin = twoFactorPin;
    this.authService.authenticate(() => (this.submitting = false));
  }
}
