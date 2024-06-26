import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserDataService {
  private secretKey = environment.ENCRYPTION_KEY;

  constructor() {}

  // Helper method to get cookie by name
  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Helper method to set cookie with expiry
  private setCookie(name: string, value: string, expiryDays: number): void {
    const date = new Date();
    date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Helper method to erase cookie
  private eraseCookie(name: string): void {
    document.cookie = name + "=; Max-Age=-99999999;";
  }

  // Encrypt data
  private encryptData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    ).toString();
  }

  // Decrypt data
  private decryptData(data: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error("Error decrypting data", e);
      return null;
    }
  }

  setCustomeLocalStorage(name: any, data: any): any {
    localStorage.setItem(name, data);
  }

  // Get user data from local storage
  getUserDataFromLocalStorage(): any {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const userData = this.decryptData(userDataString);
      if (
        userData &&
        userData.expiry &&
        new Date(userData.expiry) > new Date()
      ) {
        return userData.data;
      } else {
        this.removeUserDataFromLocalStorage();
        return null;
      }
    }
    return null;
  }

  // Set user data in local storage with expiry
  setUserDataInLocalStorage(userData: any, expiryHours: number = 24): void {
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + expiryHours * 60 * 60 * 1000);
    const encryptedData = this.encryptData({ data: userData, expiry });
    localStorage.setItem("user", encryptedData);
  }

  // Remove user data from local storage
  removeUserDataFromLocalStorage(): void {
    localStorage.removeItem("user");
  }

  // Get user data from cookies
  getUserDataFromCookies(): any {
    const userDataString = this.getCookie("user");
    if (userDataString) {
      const userData = this.decryptData(userDataString);
      if (
        userData &&
        userData.expiry &&
        new Date(userData.expiry) > new Date()
      ) {
        return userData.data;
      } else {
        this.removeUserDataFromCookies();
        return null;
      }
    }
    return null;
  }

  // Set user data in cookies with expiry
  setUserDataInCookies(userData: any, expiryHours: number = 24): void {
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + expiryHours * 60 * 60 * 1000);
    const encryptedData = this.encryptData({ data: userData, expiry });
    this.setCookie("user", encryptedData, expiryHours);
  }

  // Check if user data cookie has expired
  isUserDataCookieExpired(): boolean {
    const userDataString = this.getCookie("user");
    if (userDataString) {
      const userData = this.decryptData(userDataString);
      if (
        userData &&
        userData.expiry &&
        new Date(userData.expiry) > new Date()
      ) {
        return false; // Not expired
      }
    }
    return true; // Expired or not found
  }

  // Remove user data from cookies
  removeUserDataFromCookies(): void {
    this.eraseCookie("user");
  }
}
