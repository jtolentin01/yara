import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BreadcrumbsComponent } from "../app-components/breadcrumbs/breadcrumbs.component";
import { UserDataService } from "../services/user-data/user-data.service";
import { WebSocketService } from "../services/web-socket/web-socket.service";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterModule, CommonModule, BreadcrumbsComponent],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit, OnDestroy {
  tools: any = {};
  userDataFromLocalStorage: any;
  userDataCookieExpired: any;
  isDarkMode = false;

  constructor(
    private userDataService: UserDataService,
    private websocketService: WebSocketService
  ) {}

  public user = this.userDataService.getUserDataFromCookies();

  ngOnInit(): void {
    this.saveUserData();
    console.log("User Data from Cookies:", this.user);

    this.userDataCookieExpired = this.userDataService.isUserDataCookieExpired();
    if (this.userDataCookieExpired == true) {
      this.userDataService.removeUserDataFromCookies();
      this.userDataService.removeUserDataFromLocalStorage();
    }
    this.websocketService.connectSocket();

    // Example of sending a message
    this.websocketService.sendMessage("Test from client");

    // Example of receiving messages
    this.websocketService.receiveMessages().subscribe((message) => {
      console.log("Received from server:", message);
    });
  }

  ngOnDestroy() {
    this.websocketService.disconnectSocket();
  }

  // Initializes socket connection
  initializeSocketConnection() {
    this.websocketService.connectSocket();
  }


  // Disconnects socket connection
  disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  saveUserData(): void {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      accessLevel: 1,
      authorization: "235SDgsDZdfsE43fsSZfsdf25sdZ",
    };

    this.userDataService.setUserDataInLocalStorage(userData);
    this.userDataService.setUserDataInCookies(userData);
  }

  test = (params: any) => {
    alert(`${params}`);
  };

  toggleDarkMode = () => {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle("dark", this.isDarkMode);
  };
}
