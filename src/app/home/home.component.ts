import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppAuthService } from 'src/shared/auth/app-auth.service';
import { User, UserMicroServicesServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { TwoFactorAuthModalComponent } from '../two-factor-auth/two-factor-auth-modal/two-factor-auth-modal.component';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [accountModuleAnimation()]
})
export class HomeComponent {
  constructor(
    private _userMicroServices: UserMicroServicesServiceProxy,
    private _modalService: BsModalService,
    public authService: AppAuthService,
    private route: Router
  ) {
  }

  isToggleTrue: boolean;

  ngOnInit(): void {
  }

  showTwoFactorAuthModal(): void {
    const modalRef: BsModalRef = this._modalService.show(TwoFactorAuthModalComponent);
    modalRef.content.validateTwoFactorResult.subscribe((bool: boolean) => {
      if (bool) {
        this.route.navigate(["secret-place"]);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  secret(): void {
    const userId = 1;
    this._userMicroServices.getUserById(userId).subscribe(
      (result: User) => {
        this.isToggleTrue = result.isTwoFactorEnabled;

        if (this.isToggleTrue) {
          this.showTwoFactorAuthModal();
        }
      }
    );
  }

  twoFactorSetup() {
    this.route.navigate(["two-factor-auth-setup"]);
  }
}


