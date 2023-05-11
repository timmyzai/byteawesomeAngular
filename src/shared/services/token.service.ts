import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  setToken(accessToken: string, expiryDate: Date): void {
    document.cookie = `accessToken=${accessToken};expires=${expiryDate.toUTCString()};path=/;`;
  }

  clearToken(): void {
    document.cookie = `accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

