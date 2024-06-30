import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private apiUrl = '/api/v1/tools/list/all';
  constructor(private http: HttpClient, private userDataService: UserDataService) {}
  public user = this.userDataService.getUserDataFromCookies();

  getTools(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.user.authorization
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }
}
