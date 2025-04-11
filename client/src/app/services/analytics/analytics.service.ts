import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analyticsUrl = '/api/v1/analytics/main';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get<any>(this.analyticsUrl);
  }

}
