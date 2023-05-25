import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from 'src/shared/AppConsts';
import { Observable, from, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitializer {
  constructor(private http: HttpClient) { }

  private getAppConfig(): Observable<any> {
    return this.http.get<any>('assets/appconfig.json').pipe(
      tap((response) => {
        AppConsts.appBaseUrl = response.appBaseUrl;
        AppConsts.remoteAuthServiceBaseUrl = response.remoteAuthServiceBaseUrl;
        AppConsts.remoteUserServiceBaseUrl = response.remoteUserServiceBaseUrl;
      })
    );
  }
  
  init(): () => Promise<void> {
    return () => this.getAppConfig().toPromise();
  }
  

}
