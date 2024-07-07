import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private allUsers = "/api/v1/users/all";

  constructor(private http: HttpClient) { }

  getAllUSers(
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
    return this.http.get<any>(this.allUsers, { params });
  }

}
