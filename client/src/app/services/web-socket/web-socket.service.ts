import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    // Connect to your socket.io server
    this.socket = io('http://localhost:5000');
  }

  // Method to connect to socket.io server
  connectSocket() {
    this.socket.connect();
  }

  // Method to send a message to socket.io server
  sendMessage(message: any) {
    this.socket.emit("message", message);
  }

  // Method to receive messages from socket.io server
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

  // Method to disconnect from socket.io server
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
}
