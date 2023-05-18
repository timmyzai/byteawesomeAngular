import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookiesService } from '../services/cookies.service';
import { AppConsts } from '../AppConsts';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private _cookieService: CookiesService,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this._cookieService.getCookieValue(AppConsts.authorization.encryptedAuthTokenName);

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request);
    }
}
