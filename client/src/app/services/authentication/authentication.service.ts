import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = '/api/v1/auth/login';

  constructor(private http: HttpClient) {}

  submitFormData(formData: any): Observable<any> {
    const body = { ...formData };
    return this.http.post<any>(this.apiUrl, body);
  }
}