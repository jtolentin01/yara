import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
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
  urlSegments: string[] = [];

  constructor(
    private userDataService: UserDataService,
    private websocketService: WebSocketService,
    private activatedRoute: ActivatedRoute
  ) {}

  public user = this.userDataService.getUserDataFromCookies();
  public userMonitoringData = {
    reqType: 1,
    reqBody: {
      userId: this.user.id,
      userEmail: this.user.email,
      active: true
    }
  }

  ngOnInit(): void {
    this.userDataCookieExpired = this.userDataService.isUserDataCookieExpired();
    if (this.userDataCookieExpired == true) {
      this.userDataService.removeUserDataFromCookies();
      this.userDataService.removeUserDataFromLocalStorage();
    }

    this.getUrlSegments();

    // this.websocketService.connectSocket();

    // this.websocketService.sendMessage(this.userMonitoringData);

    // this.websocketService.receiveMessages().subscribe((message) => {
    //   console.log("Received from server:", message);
    // });
  }

  getUrlSegments() {
    this.activatedRoute.url.subscribe(segments => {
      this.urlSegments = segments.map(segment => segment.path);
      console.log(segments); // This will print each segment in the console
    });
  }

  logoutExec(): void {
    this.userDataService.removeUserDataFromCookies();
    localStorage.setItem('user', this.user.email);
    localStorage.setItem('expired', 'true');
    window.location.reload();
  }

  ngOnDestroy() {
    this.websocketService.disconnectSocket();
  }

  initializeSocketConnection() {
    this.websocketService.connectSocket();
  }

  disconnectSocket() {
    this.websocketService.disconnectSocket();
  }

  test = (params: any) => {
    alert(`${params}`);
  };

  toggleDarkMode = () => {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle("dark", this.isDarkMode);
  };
}
