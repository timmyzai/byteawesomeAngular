import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from 'src/shared/AppConsts';
import { CookiesService } from 'src/shared/services/cookies.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private _cookieService: CookiesService,
    private route: Router
  ) {
  }
  isLoggedIn: boolean = false;

  ngOnInit(): void {
    this.checkUserLogin();
  }

  checkUserLogin() {
    const accessToken = this._cookieService.getCookieValue('accessToken');
    const encryptedAccessToken = this._cookieService.getCookieValue(AppConsts.authorization.encryptedAuthTokenName);

    if (accessToken && encryptedAccessToken) {
      this.isLoggedIn = true;
    } else {
      this.route.navigate(["login"]);
    }
  }
}
