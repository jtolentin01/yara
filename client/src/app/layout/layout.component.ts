import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserDataService } from "../services/user-data/user-data.service";
import { WebSocketService } from "../services/web-socket/web-socket.service";
import { filter } from 'rxjs/operators';


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
  headerTitle = 'Downloads'; // Default title

  constructor(
    private userDataService: UserDataService,
    private websocketService: WebSocketService,
    private activatedRoute: ActivatedRoute,
    private router: Router // Inject Router
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

  public profileImg = `https://yara-web.s3.ap-southeast-2.amazonaws.com/img/${this.user.profile}`;

  ngOnInit(): void {
    this.userDataCookieExpired = this.userDataService.isUserDataCookieExpired();
    if (this.userDataCookieExpired == true) {
      this.userDataService.removeUserDataFromCookies();
      this.userDataService.removeUserDataFromLocalStorage();
    }

    console.log(this.user);
    this.getUrlSegments();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateHeaderTitle();
    });

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

  updateHeaderTitle() {
    const currentRoute = this.router.url.split('/')[1];
    switch (currentRoute) {
      case 'dashboard':
        this.headerTitle = 'Dashboard';
        break;
      case 'tools':
        this.headerTitle = 'Tools';
        break;
      case 'downloads':
        this.headerTitle = 'Downloads';
        break;
      default:
        this.headerTitle = 'Application'; // Default title if no match
    }
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
