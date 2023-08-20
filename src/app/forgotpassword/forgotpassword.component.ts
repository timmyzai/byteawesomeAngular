import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { ChangeUserPasswordByEmailDto, EntityUserDto, EntityUserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css'],
  animations: [accountModuleAnimation()]
})
export class ForgotpasswordComponent implements OnInit {
  isLoading: boolean = false;
  otpLength: number = 6;
  otpBoxes: string[] = Array(this.otpLength).fill('');
  isValidInput: boolean = false;
  isInvalidPin: boolean = false;
  submitting: boolean = false;
  isResendClicked: boolean = false;
  isPasswordNotMatch: boolean = false;
  isEmailInvalid: boolean = false;
  isEmailFilled: boolean = false;
  email: string;
  newPassword: string;
  confirmPassword: string;
  pin: string;
  countdown: number = 120;

  constructor(
    private route: Router,
    public appAuthService: AppappAuthService,
    private responseHandler: ApiResponseHandlerService,
    private userService: UserServiceProxy,
    private notify: NotifyServices,
  ) {
  }
  ngOnInit(): void {
    this.validateEmail(null);
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
    this.pin = otp;
    this.validateAllInputs();
  }
  validateEmail(event: any): void {
    if (event == null || event.target.value == null || event.target.value == '') {
      this.isEmailFilled = false;
      this.isEmailInvalid = true;
      return;
    }
    this.isEmailFilled = true;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var isValidEmail = emailPattern.test(event.target.value);
    this.isEmailInvalid = !isValidEmail;
    this.validateAllInputs();
  }
  validatePassword() {
    this.isPasswordNotMatch = this.newPassword !== this.confirmPassword;
    this.validateAllInputs();
  }
  async submit() {
    try {
      this.submitting = true;
      var param = new ChangeUserPasswordByEmailDto();
      param.tacCode = this.pin;
      param.confirmPassword = this.confirmPassword;
      param.newPassword = this.newPassword;
      param.email = this.email;

      await this.userService.changeUserPasswordByEmail(param).toPromise()
        .then((userResponseDto: EntityUserDtoResponseDto) => {
          if (userResponseDto.isSuccess) {
            this.notify.showSuccess("Password changed successfully", "Success");
            setTimeout(() => {
              this.route.navigate(["login"]);
            }, 2000);
          } else {
            this.responseHandler.handleResponse<EntityUserDto>(userResponseDto, null, 'changeUserPasswordByEmail Failed');
          }
        })
        .catch((error: any) => {
          this.responseHandler.handleUnhandledException(error, "changeUserPasswordByEmail Failed");;
        });
    } finally {
      this.submitting = false;
    }
  }

  back() {
    this.route.navigate(["login"]);
  }

  sendForgotPasswordEmail(): void {
    this.isResendClicked = true;
    this.countdown = 120;
    const countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(countdownInterval);
        this.isResendClicked = false;
      }
    }, 1000);
    this.userService.sendForgotPasswordEmail(this.email).subscribe(
      response => {
        if (response.isSuccess) {
          setTimeout(() => {
            this.isResendClicked = false;
          }, this.countdown * 1000);
          this.notify.showSuccess("Forgot email sent successfully", "Success");
        } else {
          clearInterval(countdownInterval);
          this.isResendClicked = false;
          this.responseHandler.handleResponse<boolean>(response, null, 'sendForgotPasswordEmail Failed');
        }
      },
      error => {
        clearInterval(countdownInterval);
        this.isResendClicked = false;
        this.notify.showError(error, "Failed");
      }
    );
  }

  validateAllInputs() {
    this.isValidInput = (!this.isEmailInvalid && !this.isInvalidPin && !this.isPasswordNotMatch && this.newPassword != undefined && this.confirmPassword != undefined && this.email != undefined && this.pin != undefined);
  }
}
