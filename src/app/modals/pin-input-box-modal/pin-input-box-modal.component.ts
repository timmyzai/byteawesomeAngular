import { Component, EventEmitter, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pin-input-box-modal',
  templateUrl: './pin-input-box-modal.component.html',
  styleUrls: ['./pin-input-box-modal.component.css'],
})
export class PinInputBoxModalComponent {
  isLoading: Boolean;
  otpLength: number = 6;
  otpBoxes: string[] = Array(this.otpLength).fill('');
  isValidInput: Boolean = false;
  isInvalidPin: Boolean = false;
  pinInputResult: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public _bsModalRef: BsModalRef,
  ) {
  }

  hideModal() {
    this.pinInputResult.emit(""); 
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
    const twoFactorPin = this.otpBoxes.join('');
    this.pinInputResult.emit(twoFactorPin);
    this._bsModalRef.hide();
  }
}
