import { Injectable } from '@angular/core';
import { NotifyServices } from './notify.services';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiResponseHandlerService {

  constructor(private notify: NotifyServices) { }

  async handleResponse<T>(response: any, successCallback: (data: T) => T | void, errorTitle: string): Promise<T | void> {
    if (response.isSuccess) {
      return successCallback(response.result);
    } else {
      const errorMessage = response.errorMessages && response.errorMessages.length > 0 ? response.errorMessages.join(', ') : 'No error message';
      this.notify.showError(errorMessage, errorTitle);
    }
  }

  handleUnhandledException(error: any, message: string): void {
    const errorMessage = error.response || error;
    this.notify.showError(errorMessage, message);
  }
}
