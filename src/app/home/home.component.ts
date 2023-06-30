import { AfterViewChecked, AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppAuthService } from 'src/shared/auth/app-auth.service';

import { TwoFactorAuthModalComponent } from '../modals/two-factor-auth-modal/two-factor-auth-modal.component';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { UserDto, UserDtoResponseDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [accountModuleAnimation()]
})
export class HomeComponent implements AfterViewInit {
  user: UserDto;
  isToggleTrue: boolean = false;

  constructor(
    private _userService: UserServiceProxy,
    private _modalService: BsModalService,
    public authService: AppAuthService,
    private route: Router
  ) {
  }

  ngAfterViewInit(): void {
    const userId = localStorage.getItem('loggedInUserId');

    this._userService.getById(userId).subscribe(
      (userResponseDto: UserDtoResponseDto) => {
        this.user = userResponseDto.result;
      }
    );
  }

  logout(): void {
    this.authService.logout();
  }
  secret(): void {
    this.isToggleTrue = this.user.isTwoFactorEnabled;

    if (this.isToggleTrue) {
      this.showTwoFactorAuthModal();
    } else {
      this.navigateToSecret();
    }
  }
  showTwoFactorAuthModal(): void {
    const modalRef: BsModalRef = this._modalService.show(TwoFactorAuthModalComponent);
    modalRef.content.validateTwoFactorResult.subscribe((bool: boolean) => {
      if (bool) {
        this.navigateToSecret();
      }
    });
  }
  private navigateToSecret() {
    this.route.navigate(["secret-place"]);
  }
  twoFactorSetup() {
    this.route.navigate(["two-factor-auth-setup"]);
  }
}


