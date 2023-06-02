import { Component, Input } from '@angular/core';
import { WalletDto, WalletGroupDto } from 'src/shared/service-proxies/wallet-service-proxies';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'] 
})
export class WalletComponent {
  @Input() wallets: WalletDto[];
}
