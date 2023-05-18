import { Component } from '@angular/core';
import { accountModuleAnimation } from 'src/shared/animations/routerTransition';

@Component({
  selector: 'app-secret-place',
  templateUrl: './secret-place.component.html',
  styleUrls: ['./secret-place.component.css'],
  animations: [accountModuleAnimation()]
})
export class SecretPlaceComponent  {
}
