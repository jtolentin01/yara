import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DeleteService {
  private userBaseUrl = "/api/v1/users/delete";

  constructor(private http: HttpClient) { }

  deleteUser(id: any): Observable<any> {
    return this.http.delete<any>(`${this.userBaseUrl}/${id}`);
  }
}
