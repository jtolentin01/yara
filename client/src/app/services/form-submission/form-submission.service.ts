import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private newBatchBaseUrl = '/api/v1/batch/new'; 
  private newRequestBaseUrl = '/api/v1/batch/new/parser'; 
  private newUserBaseUrl = '/api/v1/users/new'; 
  private newUserBaseUrlNoAuth = '/api/v1/creation/user/new';
  private updateUserBaseUrl = '/api/v1/users/update';
  private updateUserPwBaseUrlNoAuth = '/api/v1/creation/user/update';
  private fsr = '/api/v1/public/app/fsr';
  private newWordList = '/api/v1/root/new/preset/word';
  private updateWordList = '/api/v1/root/update/preset/word';
  private deleteWordList = '/api/v1/root/delete/preset/word';

  constructor(private http: HttpClient) {}

  submitFormData(formData: any, additionalData?: any, customHeaders?: { [header: string]: string }): Observable<any> {
    const body = { ...formData, ...additionalData };

    let headers = new HttpHeaders();
    if (customHeaders) {
      for (const header in customHeaders) {
        headers = headers.append(header, customHeaders[header]);
      }
    }

    return this.http.post<any>(this.newBatchBaseUrl, body, { headers });
  }
  submitNewUser(userData: any): Observable<any> {
    return this.http.post<any>(this.newUserBaseUrl, userData);
  }

  submitNewRequest(form: any): Observable<any> {
    return this.http.post<any>(this.newRequestBaseUrl, form);
  }

  submitFsr(fsrForm: any): Observable<any> {
    return this.http.post<any>(this.fsr, fsrForm);
  }

  submitNewWordPreset(form: any): Observable<any> {
    return this.http.post<any>(this.newWordList, form);
  }

  submitUpdatedWordPreset(title:any,wordlist:any,id:any): Observable<any> {
    return this.http.post<any>(this.updateWordList,{id:id,title,wordlist});
  }

  submitDeleteWordPreset(id:any): Observable<any> {
    return this.http.delete<any>(`${this.deleteWordList}/${id}`);
  }

  submitNewUserNoAuth(userData: any): Observable<any> {
    return this.http.post<any>(this.newUserBaseUrlNoAuth, userData);
  }

  updateUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.updateUserBaseUrl}/${userData._id}`, userData);
  }

  updatePassword(userData: any): Observable<any> {
    return this.http.post<any>(`${this.updateUserBaseUrl}/pw/${userData._id}`, userData);
  }

  updatePasswordNoAuth(userData: any): Observable<any> {
    return this.http.post<any>(`${this.updateUserPwBaseUrlNoAuth}/pw/${userData._id}`, userData);
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.post<any>(`${this.updateUserBaseUrl}/profile/${userData._id}`, userData);
  }
}
