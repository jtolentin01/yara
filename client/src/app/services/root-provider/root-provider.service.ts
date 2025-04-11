import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import CryptoJS from "crypto-js";

@Injectable({
  providedIn: 'root'
})
export class RootProviderService {
  private userBaseUrl = "/api/v1/root/as3wsb";
  private wordsBaseUrl = "/api/v1/root/get/preset/word"
  private secretKey = environment.ENCRYPTION_KEY;
  constructor(private http: HttpClient) { }

  provideS3(): Observable<any> {
    return this.http.get<any>(`${this.userBaseUrl}`);
  }
  provideWords(): Observable<any> {
    return this.http.get<any>(this.wordsBaseUrl);
  }
  
  provideDecrypt = (data:any) =>{
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error("Error decrypting data", e);
      return null;
    }
  }

}
