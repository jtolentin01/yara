import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private newBatch = '/api/v1/batch/new'; 
  private newUser = '/api/v1/users/new'; 


  constructor(private http: HttpClient) {}

  submitFormData(formData: any, additionalData?: any, customHeaders?: { [header: string]: string }): Observable<any> {
    const body = { ...formData, ...additionalData };

    let headers = new HttpHeaders();
    if (customHeaders) {
      for (const header in customHeaders) {
        headers = headers.append(header, customHeaders[header]);
      }
    }

    return this.http.post<any>(this.newBatch, body, { headers });
  }
  submitNewUser(userData: any): Observable<any> {
    return this.http.post<any>(this.newUser, userData);
  }
}
