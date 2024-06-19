import { Component, OnInit, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools-list/tools.service';
import { AsinCheckerFormComponent } from '../import-forms/asin-checker-form/asin-checker-form.component';
import { ListingLoaderFormComponent } from '../import-forms/listing-loader-form/listing-loader-form.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './batch-form.component.html',
  styleUrls: ['./batch-form.component.css']
})
export class BatchFormComponent implements OnInit, AfterViewInit {
  pageTitle: string = '';
  tools: any = {};

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  private containerInitialized$ = new BehaviorSubject<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toolsService: ToolsService
  ) {

  }

  ngOnInit(): void {
    this.containerInitialized$.subscribe(initialized => {
      if (initialized) {
        this.route.url.subscribe(segments => {
          if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            this.handleRouteChange(lastSegment.path);
          } else {
            this.router.navigate(['/tools']);
          }
        });
      }
    });

    this.toolsService.getTools().subscribe(data => {
      this.tools = data;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.containerInitialized$.next(true), 0);
  }

  handleRouteChange(path: string): void {
    switch (path) {
      case 'asin-checker-v2':
        this.pageTitle = 'ASIN Checker lite V2';
        this.loadComponent(AsinCheckerFormComponent);
        break;
      case 'listing-loader-v2':
        this.pageTitle = 'Listing Loader V2';
        this.loadComponent(ListingLoaderFormComponent);
        break;
      default:
        this.pageTitle = 'Undefined';
        this.router.navigate(['/tools']);
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
