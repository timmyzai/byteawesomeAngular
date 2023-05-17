import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookiesService {
  getCookieValue(key: string): string | null {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const [cookieKey, cookieValue] = cookies[i].split('=');
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }
  setCookieValue(key, value, expiryDate?: Date) {
    if (expiryDate) {
      document.cookie = key + '=' + value + '; expires=' + expiryDate.toUTCString() + '; path=/';
    } else {
      this.deleteCookie(key);
    }
  }

  deleteCookie(key) {
    document.cookie = encodeURIComponent(key) + '=; expires=' + new Date(new Date().getTime() - 86400000).toUTCString();
  }
}
