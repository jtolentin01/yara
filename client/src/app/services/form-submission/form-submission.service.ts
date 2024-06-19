import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private apiUrl = '/api/v1/batch/new'; 

  constructor(private http: HttpClient) {}

  submitFormData(formData: any, additionalData?: any, customHeaders?: { [header: string]: string }): Observable<any> {
    const body = { ...formData, ...additionalData };

    let headers = new HttpHeaders();
    if (customHeaders) {
      for (const header in customHeaders) {
        headers = headers.append(header, customHeaders[header]);
      }
    }

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
