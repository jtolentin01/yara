import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ExternalServicesService {
  constructor(
    private http: HttpClient,
  ) { }
  viewBatchResult(id: any): Observable<any> {
    return this.http.get<any>(`https://script.google.com/macros/s/AKfycbxiPbqx0ED6plvDDJw3DhH-92n0hRugWCFMDVns4L-Yj6chY85BDkbuf9nUgj3fElA7/exec?batchid=${id}`);
  }
}
