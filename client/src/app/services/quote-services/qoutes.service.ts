import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QoutesService {
  private zenQuotesBaseUrl = '/api/v1/quotes/zen';

  constructor(private http: HttpClient) { }
  getRandomQuotes(): Observable<any> {
    return this.http.get<any>(`${this.zenQuotesBaseUrl}/random`);
  }
}
