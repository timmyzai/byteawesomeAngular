import { Component, EventEmitter, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TwoFactorAuthServiceProxy } from 'src/shared/service-proxies/service-proxies';
@Component({
  selector: 'app-two-factor-auth-modal',
  templateUrl: './two-factor-auth-modal.component.html',
  styleUrls: ['./two-factor-auth-modal.component.css'],
})
export class TwoFactorAuthModalComponent {
  isLoading: Boolean;
  otpLength: number = 6;
  otpBoxes: string[] = Array(this.otpLength).fill('');
  isValidInput: Boolean = false;
  isInvalidPin: Boolean = false;
  validateTwoFactorResult: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public _bsModalRef: BsModalRef,
    private _twoFactorAuthService: TwoFactorAuthServiceProxy,
  ) {
  }

  hideModal() {
    this.validateTwoFactorResult.emit(false); 
    this._bsModalRef.hide();
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
    this.isValidInput= otp.length === this.otpLength;
  }

  submit() {
    const userId = 1;
    const twoFactorPin = this.otpBoxes.join('');
    this._twoFactorAuthService.validateTwoFactorPIN(userId, twoFactorPin).subscribe(
      (bool) => {
        if (bool) {
          this.validateTwoFactorResult.emit(bool);
          this.hideModal();
        } else {
          this.isInvalidPin = true;
        }
      }
    )
  }
}
