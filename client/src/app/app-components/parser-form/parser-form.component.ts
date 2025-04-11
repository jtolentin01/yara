import { Component, OnInit, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ToolsService } from '../../services/tools-list/tools.service';
import { ParserInvViewComponent } from '../parsers-view/parser-inv-view/parser-inv-view.component';

interface Parser {
  name: string;
  subname: string;
  description: string;
  active: boolean;
  department: string;
}

@Component({
  selector: 'app-parser-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],  
  templateUrl: './parser-form.component.html',
  styleUrl: './parser-form.component.css'
})
export class ParserFormComponent implements OnInit, AfterViewInit{
  pageTitle: string = '';
  pageInfo: string = '';
  parsers: any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toolsService: ToolsService
  ) {}

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  private containerInitialized$ = new BehaviorSubject<boolean>(false);

  ngAfterViewInit(): void {
    setTimeout(() => this.containerInitialized$.next(true), 0);
  }

  ngOnInit(): void {
    this.containerInitialized$.subscribe(initialized => {
      if (initialized) {
        this.route.url.subscribe(segments => {
          if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];

            this.toolsService.getParsers().subscribe(data => {
              this.parsers = data.parsers.filter((parser: Parser) => parser.active);

              this.handleRouteChange(lastSegment.path);
            });
          } else {
            this.router.navigate(['/parsers']);
          }
        });
      }
    });
  }

  handleRouteChange(path: string): void {
    switch (path) {
      case 'parser-inv':
        this.pageTitle = 'Inventory Parser';
        // this.pageInfo = this.getToolInfo(path);
        this.loadComponent(ParserInvViewComponent);
        break;

      default:
        this.pageTitle = 'Undefined';
        this.router.navigate(['/parsers']);
    }
  }

  loadComponent(component: any) {
    if (this.container) {
      this.container.clear();
      this.container.createComponent(component);
    } else {
      console.error('Container is not initialized');
    }
  }

}
