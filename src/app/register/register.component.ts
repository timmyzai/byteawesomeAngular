import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { UserServiceProxy, CreateUserDto, UserDtoResponseDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  templateUrl: './register.component.html',
  animations: [accountModuleAnimation()]
})
export class RegistrationComponent {
  submitting: boolean = false;
  CreateUserDto: CreateUserDto = new CreateUserDto();
  loading: boolean = false;
  constructor(
    private userService: UserServiceProxy,
    private errorHandler: ApiErrorHandlerService,
    private route: Router,
    private notify: NotifyServices
  ) {
    this.loading = false;
  }

  async register(): Promise<void> {
    try {
      this.submitting = true;

      await this.userService.register(this.CreateUserDto).toPromise()
        .then((userResponseDto: UserDtoResponseDto) => {
          if (userResponseDto.isSuccess) {
            this.notify.showSuccess("Successfully registered.", "Success");
            setTimeout(() => {
              this.route.navigate(["login"]);
            }, 2000);
          } else {
            this.errorHandler.handleErrorResponse(userResponseDto, 'Registration Failed');
          }
        })
        .catch((error: any) => {
          this.errorHandler.handleCommonApiErrorReponse(error, "Registration Failed");;
        });
    } finally {
      this.submitting = false;
    }
  }
}

