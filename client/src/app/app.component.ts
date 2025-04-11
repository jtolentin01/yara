import { Component, AfterViewInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutComponent } from "./layout/layout.component";
import { LoadingScreenComponent } from "./app-components/loading-screen/loading-screen.component";
import { CommonModule } from "@angular/common";
import { Meta } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    LayoutComponent,
    LoadingScreenComponent,
    CommonModule,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements AfterViewInit {
  loading: boolean = true;

  constructor(private metaService: Meta) {
    this.metaService.updateTag({
      name: "description",
      content: "Yara - New Listing Tools Site with enhanced tools and workers for a fast and seamless process. Most used tool services are all now available",
    });
  }

  ngAfterViewInit() {
    this.detectDocumentLoad();
  }

  detectDocumentLoad() {
    window.addEventListener("load", () => {
      this.loading = false;
    });
  }
}
