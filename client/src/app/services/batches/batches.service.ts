import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BatchesService {
  private apiUrl = "/api/v1/batch/list";
  private deleteUrl = "/api/v1/batch/delete";

  constructor(private http: HttpClient) { }

  getBatches(
    items: number,
    page: number,
    filter: string,
    category: string,
    requestorid: string
  ): Observable<any> {
    const params = {
      items: items.toString(),
      page: page.toString(),
      filter,
      category,
      requestorid
    };
    return this.http.get<any>(this.apiUrl, { params });
  }

  deleteBatch(batchId: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${batchId}`);
  }

  searchBatch(
    items: number,
    page: number,
    importname: string
  ): Observable<any> {
    const params = {
      items: items.toString(),
      page: page.toString(),
      importname
    };
    return this.http.get<any>(this.apiUrl, { params });
  }

}
