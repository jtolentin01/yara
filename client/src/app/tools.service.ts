import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private apiUrl = '/api/v1/tools/all';

  constructor(private http: HttpClient) {}

  getTools(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
