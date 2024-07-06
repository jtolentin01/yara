import { Component, AfterViewInit  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoadingScreenComponent } from './app-components/loading-screen/loading-screen.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LayoutComponent,LoadingScreenComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  loading: boolean = true;

  ngAfterViewInit() {
    this.detectDocumentLoad();
  }

  detectDocumentLoad() {
    window.addEventListener('load', () => {
      this.loading = false;
    });
  }
}
