import { Injectable } from '@angular/core';
import { NotifyServices } from './notify.services';

@Injectable({
  providedIn: 'root'
})
export class ApiResponseHandlerService {

  constructor(private notify: NotifyServices) { }

  async handleResponse<T>(response: any, successCallback: (data: T) => void, errorTitle: string) {
    if (response.isSuccess) {
      successCallback(response.result);
    } else {
      this.handleErrorResponse(response.errorMessages, errorTitle);
    }
  }

  handleErrorResponse(errorMessages: string[], errorTitle: string) {
    const errorMessage = errorMessages && errorMessages.length > 0 ? errorMessages.join(', ') : 'No error message';
    this.notify.showError(errorMessage, errorTitle);
  }

  handleCommonApiErrorResponse(error: any, message: string): void {
    const errorMessage = error.response || error;
    this.notify.showError(errorMessage, message);
  }
}
