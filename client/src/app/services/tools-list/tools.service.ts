import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private baseUrlTools = '/api/v1/tools/list/all';
  private baseUrlParsers = '/api/v1/tools/list/all/parsers';
  private baseUrlScrapers = '/api/v1/tools/list/all/scrapers';
  constructor(private http: HttpClient, private userDataService: UserDataService) {}
  public user = this.userDataService.getUserDataFromCookies();

  getTools(): Observable<any> {
    return this.http.get<any>(this.baseUrlTools);
  }
  getParsers(): Observable<any> {
    return this.http.get<any>(this.baseUrlParsers);
  }
  getScrapers(): Observable<any> {
    return this.http.get<any>(this.baseUrlScrapers);
  }
}
