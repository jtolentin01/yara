import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private baseUrlConversation = "/api/v1/chat/ai";

  constructor(private http: HttpClient) {}

  createNewConversation(message:string): Observable<any> {
    return this.http.post<any>(`${this.baseUrlConversation}/new`, {
      message: [{
        role: "user",
        content: message,
      }],
    });
  }

  getUserChatId(): Observable<any> {
    return this.http.get<any>(this.baseUrlConversation);
  }

  getConversation(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrlConversation}/${id}`);
  }

  deleteConversation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrlConversation}/${id}`);
  }

  sendMessage(message: string, id: string): Observable<any> {
    const messagePipe = {
      message: {
        role: "user",
        content: message,
      },
    };
    return this.http.post<any>(
      `${this.baseUrlConversation}/${id}`,
      messagePipe
    );
  }
}
