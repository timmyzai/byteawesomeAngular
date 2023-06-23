import { Component } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { AppConsts } from 'src/shared/AppConsts';
import { UserServiceProxy,CreateUserDto,UserDtoResponseDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  templateUrl: './register.component.html',
})
export class RegistrationComponent {
  submitting: boolean = false;
  CreateUserDto: CreateUserDto = new CreateUserDto();
  loading: boolean =false;
  constructor(private userService: UserServiceProxy,
    private errorHandler: ApiErrorHandlerService) {
      this.loading=false;
    }

    register(): void {
      this.loading = true;
      this.submitting = true;
      this.userService.add(this.CreateUserDto).subscribe(response => {
        this.submitting = false;
        this.loading = false;
        this.errorHandler.handleSuccessResponse(response, "Successfully registered.");
        catchError(error => {
          this.errorHandler.handleErrorResponse(this.CreateUserDto, 'Registration Failed');
          this.submitting = false;
          throw error;
        })
      });
    }
}

