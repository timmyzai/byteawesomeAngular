import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppappAuthService } from 'src/shared/auth/app-auth.service';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { EntityUserDto, EntityUserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [accountModuleAnimation()]
})
export class HomeComponent implements AfterViewInit {
  user: EntityUserDto;
  isToggleTrue: boolean = false;

  constructor(
    private _userService: UserServiceProxy,
    public appAuthService: AppappAuthService,
    private route: Router
  ) {
  }
  ngAfterViewInit(): void {
    const userId = localStorage.getItem('loggedInUserId');

    this._userService.getUserById(userId).subscribe(
      (userResponseDto: EntityUserDtoResponseDto) => {
        this.user = userResponseDto.result;
      }
    );
  }
  logout(): void {
    this.appAuthService.logout(true);
  }
  twoFactorSetup() {
    this.route.navigate(["two-factor-auth-setup"]);
  }
}


