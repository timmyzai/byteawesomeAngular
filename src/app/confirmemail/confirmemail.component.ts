import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from 'src/shared/AppConsts';
import { UserServiceProxy,UserDtoResponseDto,UserDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  templateUrl: './confirmemail.component.html',
})
export class EmailConfirmationComponent implements OnInit {
    userId: string;
    token: string;
    confirmStatus: boolean =false;
    constructor(private route: ActivatedRoute,private userService: UserServiceProxy,
        private errorHandler: ApiErrorHandlerService) { }
  
    ngOnInit() {
      this.confirmStatus = false;
      this.route.queryParams.subscribe(params => {
        this.userId = params['Id'];
        this.token = params['token'];
        this.confirmEmail(this.userId,this.token);
      });
    }
    confirmEmail(userId: string, token: string): void {
      this.userService.confirmEmail(parseInt(userId), token).subscribe(
        response => {
          if (response.isSuccess) {
            this.confirmStatus = true;
            this.errorHandler.handleSuccessResponse(response, 'Email confirmed successfully');
          } else {
            this.errorHandler.handleErrorResponse(response.errorMessages, 'Email Confirmation failed');
          }
        },
        error => {
          console.error('Failed to confirm email');
        }
      );
    }
  }
