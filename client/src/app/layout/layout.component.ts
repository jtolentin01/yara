import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterModule,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserDataService } from "../services/user-data/user-data.service";
import { WebSocketService } from "../services/web-socket/web-socket.service";
import { filter } from "rxjs/operators";
import { ToolsService } from "../services/tools-list/tools.service";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterModule, CommonModule], // Correctly import RouterModule and CommonModule
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit, OnDestroy {
  tools: any = {};
  userDataFromLocalStorage: any;
  userDataCookieExpired: any;
  isDarkMode = false;
  urlSegments: string[] = [];
  headerTitle = "Dashboard";
  activeUsers: any[] = [];
  readonly profileBaseUrl =
    "https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";

  constructor(
    private userDataService: UserDataService,
    private websocketService: WebSocketService,
    private router: Router,
    private toolsService: ToolsService
  ) {}

  public user = this.userDataService.getUserDataFromCookies();
  public profileImg = `${this.profileBaseUrl}${this.user.profile}`;

  public userMonitoringData = {
    reqType: 1,
    reqBody: {
      userId: this.user.id,
      userEmail: this.user.email,
      active: true,
    },
  };

  ngOnInit(): void {
    this.userDataCookieExpired = this.userDataService.isUserDataCookieExpired();
    if (this.userDataCookieExpired == true) {
      this.logoutExec();
    }
    this.validateToken();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderTitle();
      });
  }

  validateToken(): any {
    this.toolsService.getTools().subscribe({
      next: (data) => {
        this.tools = data;
      },
      error: (error) => {
        if (error) {
          this.logoutExec();
        }
      },
    });
  }

  updateHeaderTitle() {
    const currentRoute = this.router.url.split("/")[1];
    switch (currentRoute) {
      case "dashboard":
        this.headerTitle = "Dashboard";
        break;
      case "tools":
        this.headerTitle = "Tools";
        break;
      case "downloads":
        this.headerTitle = "Downloads";
        break;
      case "users-management":
        this.headerTitle = "Manage Users";
        break;
      default:
        this.headerTitle = "Application";
    }
  }

  logoutExec(): void {
    this.userDataService.removeUserDataFromCookies();
    localStorage.setItem("user", this.user.email);
    localStorage.setItem("expired", "true");
    window.location.reload();
  }

  ngOnDestroy() {
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
