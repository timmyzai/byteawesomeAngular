import { Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: "root"
})
export class EncryptionService {
  key:string = 'TUc0emRqRXpkdw=='; // btoa(btoa(myKey));

  encrypt (str: string) {
    if (str) {
      return CryptoJS.AES.encrypt(str, this.key).toString();
    }
  }

  decrypt (encrypted: string) {
    if (encrypted) {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  }
}