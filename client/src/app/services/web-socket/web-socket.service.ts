import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { UserDataService } from "../user-data/user-data.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: Socket;
  isConnected: boolean = false;
  readonly URI = environment.production === true ? environment.APP_URI : "http://localhost:5000";

  constructor(private userDataService: UserDataService) {
    this.socket = io(this.URI);
  }

  public user = this.userDataService.getUserDataFromCookies();
  connectSocket() {
    if (this.isConnected === false) {
      this.socket.connect();
      this.sendClientDetails();
      this.isConnected = true;
    }

  }

  sendMessage(message: any) {
    this.socket.emit("message", message);
  }

  sendClientDetails() {
    const details = {
      internalId: this.user._id,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      email: this.user.email,
      department: this.user.department,
      profile: `https://yara-web.s3.ap-southeast-2.amazonaws.com/img/${this.user.profile}`
    };
    this.socket.emit('clientdetails', details)
  }
  receiveMessages(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on("message", (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  disconnectSocket() {
    this.socket.disconnect();
  }

  listenForUpdates(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('Updates:', (data) => {
        observer.next(data);
      });
    });
  }
  listenForActiveClient(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on("activeclient", (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
}
