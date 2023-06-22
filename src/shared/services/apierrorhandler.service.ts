import { Injectable } from '@angular/core';
import { NotifyServices } from './notify.services';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {

  constructor(private notify: NotifyServices) {}

  handleErrorResponse(responseDto: any, errorMessageTitle: string) {
    if (!responseDto.isSuccess) {
      const errorMessages = responseDto.errorMessages;
      if (errorMessages && errorMessages.length > 0) {
        this.notify.showError(errorMessages.join(', '), errorMessageTitle);
      } else {
        this.notify.showError('No error message', errorMessageTitle);
      }
    }
  }
  handleSuccessResponse(responseDto: any, successMessageTitle: string) {
    if (responseDto.isSuccess) {
      const successMessage = responseDto.successMessage;
      if (successMessage && successMessage.length > 0) {
        this.notify.showSuccess(successMessage.join(', '), successMessageTitle);
      } else {
        this.notify.showError('No success message', successMessageTitle);
      }
    }
  }
}
