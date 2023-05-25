import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppAuthService } from 'src/shared/auth/app-auth.service';

import { TwoFactorAuthModalComponent } from '../two-factor-auth/two-factor-auth-modal/two-factor-auth-modal.component';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';
import { UserDto, UserServiceProxy } from 'src/shared/service-proxies/user-service-proxies';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [accountModuleAnimation()]
})
export class HomeComponent {
  constructor(
    private _userService: UserServiceProxy,
    private _modalService: BsModalService,
    public authService: AppAuthService,
    private route: Router
  ) {
  }

  isToggleTrue: boolean;

  logout(): void {
    this.authService.logout();
  }
  secret(): void {
    const userId = 1;
    this._userService.getById(userId).subscribe(
      (result: UserDto) => {
        this.isToggleTrue = result.isTwoFactorEnabled;

        if (this.isToggleTrue) {
          this.showTwoFactorAuthModal();
        } else {
          this.navigateToSecret();
        }
      }
    );
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


