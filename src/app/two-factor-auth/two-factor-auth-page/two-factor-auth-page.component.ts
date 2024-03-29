import { Component, } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { LoginResultDto, LoginResultDtoResponseDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';

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
  submitting: boolean = false;

  constructor(
    private route: Router,
    public appAuthService: AppappAuthService,
    private responseHandler: ApiResponseHandlerService,
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
    this.submitting = true;
    const twoFactorPin = this.otpBoxes.join('');
    this.appAuthService.LoginDto.twoFactorPin = twoFactorPin;
    this.appAuthService.authenticate((loginResult: LoginResultDtoResponseDto) => {
      this.responseHandler.handleResponse<LoginResultDto>(loginResult, null, 'authenticate Failed');
      this.submitting = false;
    });
  }

  back() {
    this.route.navigate(["login"]);
  }
}
