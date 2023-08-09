import { Component, EventEmitter, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
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
  twoFactorPinResult: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public _bsModalRef: BsModalRef,
  ) {
    this._bsModalRef.onHidden.subscribe(() => {
      this.hideModal();
    });
  }

  hideModal() {
    this.twoFactorPinResult.emit(null);
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
    this.isValidInput = otp.length === this.otpLength;
  }

  submit() {
    const twoFactorPin = this.otpBoxes.join('');
    this.twoFactorPinResult.emit(twoFactorPin);
    this._bsModalRef.hide();
  }
}
