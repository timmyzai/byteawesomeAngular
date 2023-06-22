import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from 'src/shared/AppConsts';
import { UserServiceProxy,UserDtoResponseDto,UserDto } from 'src/shared/service-proxies/user-service-proxies';
import { ApiErrorHandlerService } from 'src/shared/services/apierrorhandler.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  email: string;
  constructor(private route: ActivatedRoute,private userService: UserServiceProxy,
    private errorHandler: ApiErrorHandlerService) { }
    submitForm() {
    console.log('Email:', this.email);
    this.userService.resetPassword(this.email).subscribe(response => {
      try{  
      if(response.isSuccess){
          this.errorHandler.handleSuccessResponse(response.displayMessage,"Password reset link successfully sent to registered mail id.");
        console.log('Password reset link successfully sent to registered mail id.');
        }
        else{
            this.errorHandler.handleErrorResponse(response.errorMessages,"Email Confirmation failed");
        }
      }
      catch{
       this.errorHandler.handleErrorResponse(response.errorMessages, "Failed to trigger password reset link");
      }
      });
    }
}
