import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserDataService } from "../services/user-data/user-data.service";
import { WebSocketService } from "../services/web-socket/web-socket.service";
import { filter } from "rxjs/operators";
import { ToolsService } from "../services/tools-list/tools.service";
import { ChatService } from "../services/chat/chat.service";
import { FormsModule } from "@angular/forms";
import { ToastService, AngularToastifyModule } from "angular-toastify";
import { ModalComponent } from "../app-components/modal/modal.component";
import { QoutesService } from "../services/quote-services/qoutes.service";

interface quoteCard {
  quote: string;
  author: string;
  background: string;
}

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, AngularToastifyModule, ModalComponent],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})

export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  quote: quoteCard = { quote: '', author: '', background: '' };
  isSidebarExpanded: boolean = false;
  isChatOpen: boolean = false;
  tools: any = {};
  isModalOpen = false;
  userDataFromLocalStorage: any;
  userDataCookieExpired: any;
  isDarkMode = false;
  urlSegments: string[] = [];
  headerTitle = "Dashboard";
  activeUsers: any[] = [];
  messages: any[] = [];
  inputMessage: string = "";
  chatId: string = "";
  artBackgrounds: string[] = [
    "https://samuelearp.com/wp-content/uploads/2023/10/IMG_1512-scaled.jpeg",
    "https://w0.peakpx.com/wallpaper/165/747/HD-wallpaper-beautiful-landscape-digital-art.jpg",
    "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840/1ef80945440175.5607a2a1b2658.JPG",
    "https://cdn.shopify.com/s/files/1/1130/7582/files/The_Course_of_Empire_Thomas_Cole_600x600.webp?v=1693093774",
    "https://springfieldmuseums.org/wp-content/uploads/2020/03/summer-landscape-painting-980x646.jpg",
    "https://samuelearp.com/wp-content/uploads/2023/05/36_image-asset.jpg",
    "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840/78cd8445440169.5607a34add678.JPG",
    "https://cdn.britannica.com/60/95760-050-899F8959/River-Landscape-canvas-oil-Adriaen-van-de-1663.jpg",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d4a1685-9933-4c49-829c-8e298fef2f89/dfr878n-6096a1e4-f93a-4dd2-97fc-3f10dd8b3512.png/v1/fill/w_1183,h_676,q_70,strp/lofi_anime_wallpaper_by_pikswell_dfr878n-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTUzNiIsInBhdGgiOiJcL2ZcLzVkNGExNjg1LTk5MzMtNGM0OS04MjljLThlMjk4ZmVmMmY4OVwvZGZyODc4bi02MDk2YTFlNC1mOTNhLTRkZDItOTdmYy0zZjEwZGQ4YjM1MTIucG5nIiwid2lkdGgiOiI8PTI2ODgifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.dLOPs7_XP1mGwvp2NwZ9tEf85pS5nTb8-UTLsQgeiDw",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d4a1685-9933-4c49-829c-8e298fef2f89/dftirog-62a72462-8add-4ada-a803-d0d108a0320b.png/v1/fill/w_1194,h_669,q_70,strp/retro_wave_lofi_by_pikswell_dftirog-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzE4IiwicGF0aCI6IlwvZlwvNWQ0YTE2ODUtOTkzMy00YzQ5LTgyOWMtOGUyOThmZWYyZjg5XC9kZnRpcm9nLTYyYTcyNDYyLThhZGQtNGFkYS1hODAzLWQwZDEwOGEwMzIwYi5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.D_dVO4sdNNYKkJNeCsgYEHPpUuIzVGWGINKja74W2Ag",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d4a1685-9933-4c49-829c-8e298fef2f89/dfqy5iq-f511a1f9-5265-4f07-a670-331b2b3afdcf.png/v1/fill/w_1183,h_676,q_70,strp/japan_street_by_pikswell_dfqy5iq-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTUzNiIsInBhdGgiOiJcL2ZcLzVkNGExNjg1LTk5MzMtNGM0OS04MjljLThlMjk4ZmVmMmY4OVwvZGZxeTVpcS1mNTExYTFmOS01MjY1LTRmMDctYTY3MC0zMzFiMmIzYWZkY2YucG5nIiwid2lkdGgiOiI8PTI2ODgifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.N5_-5RXE37pZgla2iEv6G1jEiI0NKzuhLxKCeHSOm-A",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d4a1685-9933-4c49-829c-8e298fef2f89/dfq9u40-585398ac-e7ce-4b4e-95e9-ed2c387030c3.png/v1/fill/w_1183,h_676,q_70,strp/the_fantasy_portal_tree_by_pikswell_dfq9u40-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTUzNiIsInBhdGgiOiJcL2ZcLzVkNGExNjg1LTk5MzMtNGM0OS04MjljLThlMjk4ZmVmMmY4OVwvZGZxOXU0MC01ODUzOThhYy1lN2NlLTRiNGUtOTVlOS1lZDJjMzg3MDMwYzMucG5nIiwid2lkdGgiOiI8PTI2ODgifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.ieRQ8pWAsMhXekUFGhMhRKsAwjyBEj9tpu7TV-uyivE",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d5510b7c-9501-4155-82c8-84f254405621/dir2sjn-1a37827b-92bb-44d7-9745-935e8bbaefca.jpg/v1/fill/w_1192,h_670,q_70,strp/minty_morning_by_mathusalambre_dir2sjn-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvZDU1MTBiN2MtOTUwMS00MTU1LTgyYzgtODRmMjU0NDA1NjIxXC9kaXIyc2puLTFhMzc4MjdiLTkyYmItNDRkNy05NzQ1LTkzNWU4YmJhZWZjYS5qcGciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.EiZwF--DUf-mNj7cwZXEQ16ZhQY5tUdZyYAJM5PB8L8",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3be8fb7d-5a6c-4f22-b44a-615bc9cb3909/divofza-2f458ac7-851e-4aea-996b-5febe8255a29.png/v1/fill/w_1194,h_669,q_70,strp/murmurs_from_the_eldritch_by_xaynagelast_divofza-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjUyOCIsInBhdGgiOiJcL2ZcLzNiZThmYjdkLTVhNmMtNGYyMi1iNDRhLTYxNWJjOWNiMzkwOVwvZGl2b2Z6YS0yZjQ1OGFjNy04NTFlLTRhZWEtOTk2Yi01ZmViZTgyNTVhMjkucG5nIiwid2lkdGgiOiI8PTExNjQ4In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.oNzJXA9bU5pKXPlw-QCTQaklfi_1eHCY_5dEKlZjtzg",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/98f4e418-6396-4f8b-b5f8-c1b5b310955c/difwrtt-2014c58c-a271-4e98-b9f1-d719f6ff5c4f.png/v1/fill/w_894,h_894,q_70,strp/paladad_of_light_gardens_beautiful_vista_mountains_by_paladad_of_light_difwrtt-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNCIsInBhdGgiOiJcL2ZcLzk4ZjRlNDE4LTYzOTYtNGY4Yi1iNWY4LWMxYjViMzEwOTU1Y1wvZGlmd3J0dC0yMDE0YzU4Yy1hMjcxLTRlOTgtYjlmMS1kNzE5ZjZmZjVjNGYucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.SAYF7e7aeTOHueDnhCcjiHTZEHju8OL-fvJmbzgWf8Y",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7cdd9875-0b9a-4ab5-8f01-724f1e92078c/ditrjhj-9a205bb2-1177-4d7a-844d-83bf1bdfa308.jpg/v1/fill/w_894,h_894,q_70,strp/field_of_colorful_flowers_30_by_rondasdesigns_ditrjhj-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzdjZGQ5ODc1LTBiOWEtNGFiNS04ZjAxLTcyNGYxZTkyMDc4Y1wvZGl0cmpoai05YTIwNWJiMi0xMTc3LTRkN2EtODQ0ZC04M2JmMWJkZmEzMDguanBnIiwiaGVpZ2h0IjoiPD05MDAiLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ilwvd21cLzdjZGQ5ODc1LTBiOWEtNGFiNS04ZjAxLTcyNGYxZTkyMDc4Y1wvcm9uZGFzZGVzaWducy00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.eX3tAD9wE40t_IRh5ZBcdoBJJjADTwprdeFUW6gfYrI",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e6a3b38c-27e5-4e83-9ed8-c0e64662910f/ddxqdc1-a2327aa4-0f37-4a2b-94eb-0e3387d0a61d.jpg/v1/fill/w_1192,h_670,q_70,strp/wondering_by_klegs_ddxqdc1-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzMxIiwicGF0aCI6IlwvZlwvZTZhM2IzOGMtMjdlNS00ZTgzLTllZDgtYzBlNjQ2NjI5MTBmXC9kZHhxZGMxLWEyMzI3YWE0LTBmMzctNGEyYi05NGViLTBlMzM4N2QwYTYxZC5qcGciLCJ3aWR0aCI6Ijw9MTMwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.agW_LhrWYfoNbXjEFMB20n7EVVDZ77qM2x-nZn3JfJc",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/fd7a94b2-1571-47d1-a906-1e00820a690f/dc7ahs3-451c7afc-d56b-4923-8c9e-c0bdfdda09e4.png/v1/fill/w_1024,h_600/lofi_radio___day__298_by_angelganev_dc7ahs3-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjAwIiwicGF0aCI6IlwvZlwvZmQ3YTk0YjItMTU3MS00N2QxLWE5MDYtMWUwMDgyMGE2OTBmXC9kYzdhaHMzLTQ1MWM3YWZjLWQ1NmItNDkyMy04YzllLWMwYmRmZGRhMDllNC5wbmciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.hU3G_H2uGhtmy5pMu8i4O1wvaly9i6NBjSq-D24grWo",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6fb254a1-b5b9-4a24-a4bc-89d3bf39c7e0/dejy1n4-f2fd826a-c864-490a-a986-b95e63a72a95.png/v1/fill/w_1061,h_753,q_70,strp/w_a_r_m_s_p_o_t_by_dana_ulama_dejy1n4-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTEzNSIsInBhdGgiOiJcL2ZcLzZmYjI1NGExLWI1YjktNGEyNC1hNGJjLTg5ZDNiZjM5YzdlMFwvZGVqeTFuNC1mMmZkODI2YS1jODY0LTQ5MGEtYTk4Ni1iOTVlNjNhNzJhOTUucG5nIiwid2lkdGgiOiI8PTE2MDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.zxfKXJl91nz0_HzDBuBcPTh8dusHCeGB_kpqDKmba-Y",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6fb254a1-b5b9-4a24-a4bc-89d3bf39c7e0/dg84y4t-1ef5e4f4-5d2a-4b0c-b801-31c534abeb7f.png/v1/fit/w_828,h_1058,q_70,strp/blue_by_dana_ulama_dg84y4t-414w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTYzNSIsInBhdGgiOiJcL2ZcLzZmYjI1NGExLWI1YjktNGEyNC1hNGJjLTg5ZDNiZjM5YzdlMFwvZGc4NHk0dC0xZWY1ZTRmNC01ZDJhLTRiMGMtYjgwMS0zMWM1MzRhYmViN2YucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.qHlvs90X5azJqNdKcWkCX7wnFu3Bq46He5jhHdwwSzM"
  ]
  ngAfterViewInit() {
    this.scrollToBottom();
  }
  readonly profileBaseUrl =
    "https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";

  constructor(
    private userDataService: UserDataService,
    private websocketService: WebSocketService,
    private router: Router,
    private toolsService: ToolsService,
    private chatService: ChatService,
    private toastService: ToastService,
    private qoutesService: QoutesService
  ) { }

  public user = this.userDataService.getUserDataFromCookies()
    ? this.userDataService.getUserDataFromCookies()
    : "";

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
    // this.generateRandomQuotes();
    this.updateConversation();
    this.userDataCookieExpired = this.userDataService.isUserDataCookieExpired();
    if (this.userDataCookieExpired == true) {
      this.logoutExec();
      window.location.reload();
    }
    this.validateToken();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderTitle();
      });
  }
  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }
  toggleChatbox(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }
  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  generateRandomQuotes(): void {
    this.qoutesService.getRandomQuotes().subscribe((response) => {
      const randomIndex = Math.floor(Math.random() * this.artBackgrounds.length);
      this.quote.quote = response[0].q;
      this.quote.author = response[0].a;
      this.quote.background = this.artBackgrounds[randomIndex];
    });
  }


  updateConversation(): void {
    this.chatService.getUserChatId().subscribe(
      (response) => {
        this.chatId = response.chatId;
        this.chatService.getConversation(this.chatId).subscribe(
          (response) => {
            this.messages = response.messages;
          },
          (error) => {
            console.error("Error fetching conversation:", error);
            this.messages = [];
          }
        );
      },
      (error) => {
        console.error("Error fetching chatId:", error);
      }
    );
  }

  deleteConversation(): void {
    try {
      if (window.confirm("Are you sure you want clear the conversation?")) {
        this.chatService
          .deleteConversation(this.chatId)
          .subscribe((response) => {
            if (response.success) {
              this.updateConversation();
              this.toastService.success("Conversation succesfully cleared!");
            } else {
              this.toastService.error(`${response.message}`);
            }
          });
      }
    } catch (e) {
      this.toastService.error(`${e}`);
    }
  }

  submitMessage(): void {
    if (this.inputMessage.trim()) {
      if (this.messages.length > 0) {
        this.messages.push({
          role: "user",
          content: this.inputMessage,
        });

        const typingMessage = {
          role: "assistant",
          content: "Typing...",
          isTyping: true,
        };
        this.messages.push(typingMessage);
        this.chatService.sendMessage(this.inputMessage, this.chatId).subscribe(
          (response) => {
            const typingIndex = this.messages.findIndex((msg) => msg.isTyping);
            if (typingIndex !== -1) {
              this.messages.splice(typingIndex, 1);
            }

            if (response?.gptMessage?.content) {
              this.messages.push({
                role: "assistant",
                content: response.gptMessage.content,
              });
            } else {
              this.messages.push({
                role: "assistant",
                content: "I'm sorry, I couldn't get a response.",
              });
            }

            this.inputMessage = "";
          },
          (error) => {
            console.error("Error sending message:", error);
          }
        );
      } else {
        this.messages.push({
          role: "user",
          content: this.inputMessage,
        });

        const typingMessage = {
          role: "assistant",
          content: "Typing...",
          isTyping: true,
        };
        this.messages.push(typingMessage);
        this.chatService.createNewConversation(this.inputMessage).subscribe(
          (response) => {
            const typingIndex = this.messages.findIndex((msg) => msg.isTyping);
            if (typingIndex !== -1) {
              this.messages.splice(typingIndex, 1);
            }

            if (response?.gptMessage?.content) {
              this.messages.push({
                role: "assistant",
                content: response.gptMessage.content,
              });
            } else {
              this.messages.push({
                role: "assistant",
                content: "I'm sorry, I couldn't get a response.",
              });
            }

            this.inputMessage = "";
            this.updateConversation();
          },
          (error) => {
            console.error("Error sending message:", error);
          }
        );
      }
    }
  }

  validateToken(): any {
    this.toolsService.getTools().subscribe({
      next: (data) => {
        this.tools = data;
      },
      error: (error) => {
        if (error) {
          this.logoutExec();
          window.location.reload();
        }
      },
    });
  }

  updateHeaderTitle() {
    const currentRoute = this.router.url.split("?")[0].split("/")[1];
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
      case "parsers":
        this.headerTitle = "Parsers";
        break;
      case "users-management":
        this.headerTitle = "Manage Users";
        break;
      case "profile":
        this.headerTitle = "Profile";
        break;
      case "terms-condition":
        this.headerTitle = "Terms & Condition";
        break;
      case "documentation":
        this.headerTitle = "Documentation";
        break;
      default:
        this.headerTitle = "Dashboard";
    }
  }

  logoutExec(): void {
    this.userDataService.removeUserDataFromCookies();
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
