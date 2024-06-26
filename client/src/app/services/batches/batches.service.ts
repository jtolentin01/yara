import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BatchesService {
  private apiUrl = "/api/v1/batch/list";

  constructor(private http: HttpClient) {}

  getBatches(
    items: number,
    page: number,
    filter: string,
    category: string
  ): Observable<any> {
    const params = {
      items: items.toString(),
      page: page.toString(),
      filter,
      category,
    };
    return this.http.get<any>(this.apiUrl, { params });
  }
}
