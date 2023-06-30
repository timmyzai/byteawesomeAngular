import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { UserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';

@Component({
  selector: 'app-secret-place',
  templateUrl: './secret-place.component.html',
  styleUrls: ['./secret-place.component.css'],
  animations: [accountModuleAnimation()]
})
export class SecretPlaceComponent implements OnInit {
  constructor(
    private _userService: UserServiceProxy,
    public authService: AppAuthService,
    private route: Router
  ) {
  }
  ngOnInit(): void {
    const userId = localStorage.getItem('loggedInUserId');
    this._userService.getById(userId).subscribe(
      (userDtoResponseDto: UserDtoResponseDto) => {
        if (userDtoResponseDto.result.isTwoFactorEnabled) {
          this.route.navigate(["home"]);
        }
      }
    );
  }

}
