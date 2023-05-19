import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Injectable({
    providedIn: "root"
})
export class NotifyServices {
    constructor(public toastr: ToastrService) { }

    showSuccess(msg: string, title: string, timeOut: number = 3) {
        this.toastr.success(msg, title, { timeOut: timeOut * 1000, });
    }
    showError(msg: string, title: string, timeOut: number = 3) {
        this.toastr.error(msg, title, { timeOut: timeOut * 1000, });
    }
    showInfo(msg: string, title: string, timeOut: number = 3) {
        this.toastr.info(msg, title, { timeOut: timeOut * 1000, });
    }
    showWarning(msg: string, title: string, timeOut: number = 3) {
        this.toastr.warning(msg, title, { timeOut: timeOut * 1000, });
    }
}