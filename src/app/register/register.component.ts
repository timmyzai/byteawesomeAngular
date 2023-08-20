import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { UserServiceProxy, RegisterDto, EntityUserDtoResponseDto, EntityUserDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiResponseHandlerService } from 'src/shared/services/apierrorhandler.service';
import { NotifyServices } from 'src/shared/services/notify.services';

@Component({
  templateUrl: './register.component.html',
  animations: [accountModuleAnimation()]
})
export class RegistrationComponent {
  submitting: boolean = false;
  RegisterDto: RegisterDto = new RegisterDto();
  loading: boolean = false;
  constructor(
    private userService: UserServiceProxy,
    private responseHandler: ApiResponseHandlerService,
    private route: Router,
    private notify: NotifyServices
  ) {
    this.loading = false;
  }

  async register(): Promise<void> {
    try {
      this.submitting = true;

      await this.userService.register(this.RegisterDto).toPromise()
        .then((userResponseDto: EntityUserDtoResponseDto) => {
          if (userResponseDto.isSuccess) {
            this.notify.showSuccess("Successfully registered.", "Success");
            setTimeout(() => {
              this.route.navigate(["login"]);
            }, 2000);
          } else {
            this.responseHandler.handleResponse<EntityUserDto>(userResponseDto, null, 'Registration Failed');
          }
        })
        .catch((error: any) => {
          this.responseHandler.handleUnhandledException(error, "Registration Failed");;
        });
    } finally {
      this.submitting = false;
    }
  }
}

