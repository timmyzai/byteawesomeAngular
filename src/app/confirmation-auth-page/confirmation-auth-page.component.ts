import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { LoginResultDto, LoginResultDtoResponseDto } from 'src/shared/service-proxies/user-service-proxies';
import { UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { CookiesService } from 'src/shared/services/cookies.service';
import { EncryptionService } from 'src/shared/services/encryption.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  selector: 'app-confirmation-auth-page',
  templateUrl: './confirmation-auth-page.component.html',
  styleUrls: ['./confirmation-auth-page.component.css'],
  animations: [accountModuleAnimation()]
})
export class ConfirmationAuthPageComponent implements OnInit {
  isLoading: boolean = false;
  otpLength: number = 6;
  otpBoxes: string[] = Array(this.otpLength).fill('');
  isValidInput: boolean = false;
  isInvalidPin: boolean = false;
  submitting: boolean = false;
  isResendClicked: boolean = false;
  currentUserEmail: string;

  constructor(
    private route: Router,
    public appAuthService: AppappAuthService,
    private responseHandler: ApiResponseHandlerService,
    private userService: UserServiceProxy,
    private notify: NotifyServices,
    private _cookieService: CookiesService,
    private _encryptionService: EncryptionService,
  ) {
  }
  ngOnInit(): void {
    this.getUsernameAndPassword();
  }

  getUsernameAndPassword() {
    this.isLoading = true;
    var username: string = this._cookieService.getCookieValue('UserProfile.UsernameOrEmail');
    if (username) {
      this.currentUserEmail = this._encryptionService.decrypt(username);
    } else {
      this.route.navigate(["login"]);
    }
    this.isLoading = false;
  }

  onOtpChange(event: any): void {
    event.target.value = event.target.value.replace(/\s/g, "")
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
    const tacCode = this.otpBoxes.join('');
    this.appAuthService.LoginDto.emailTacCode = tacCode;
    this.appAuthService.authenticate((loginResult: LoginResultDtoResponseDto) => {
      this.responseHandler.handleResponse<LoginResultDto>(loginResult, null, 'Login Failed');
      this.submitting = false;
    });
  }

  back() {
    this.route.navigate(["login"]);
  }

  sendConfirmationEmail(): void {
    this.isResendClicked = true;
    setTimeout(() => {
      this.isResendClicked = false;
    }, 120 * 1000);
    this.userService.sendConfirmationEmail(this.currentUserEmail).subscribe(
      response => {
        if (response.isSuccess) {
          this.notify.showSuccess("Confirmation email sent successfully", "Success");
        } else {
          this.responseHandler.handleResponse<boolean>(response, null, 'Send Confirmation Emal Failed');
        }
      },
      error => {
        this.isResendClicked = false;
        this.notify.showError(error, "Failed");
      }
    );
  }
}
