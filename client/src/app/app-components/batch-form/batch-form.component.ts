import { Component, OnInit, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools-list/tools.service';
import { AsinCheckerFormComponent } from '../import-forms/asin-checker-form/asin-checker-form.component';
import { ListingLoaderFormComponent } from '../import-forms/listing-loader-form/listing-loader-form.component';
import { BehaviorSubject } from 'rxjs';
import { ListingIssuesFormComponent } from '../import-forms/listing-issues-form/listing-issues-form.component';
import { AmazonReviewsFormComponent } from '../import-forms/amazon-reviews-form/amazon-reviews-form.component';
import { AddProductFormComponent } from '../import-forms/add-product-form/add-product-form.component';
import { EditPageFormComponent } from '../import-forms/edit-page-form/edit-page-form.component';
import { EditPagePricingFormComponent } from '../import-forms/edit-page-pricing-form/edit-page-pricing-form.component';
import { GetParentFormComponent } from '../import-forms/get-parent-form/get-parent-form.component';
import { AmzIdCheckerFormComponent } from '../import-forms/amz-id-checker-form/amz-id-checker-form.component';
import { VocScraperFormComponent } from '../import-forms/voc-scraper-form/voc-scraper-form.component';
import { PrimeExclusivesFormComponent } from '../import-forms/prime-exclusives-form/prime-exclusives-form.component';
import { SkuExtractorFormComponent } from '../import-forms/sku-extractor-form/sku-extractor-form.component';
import { AmazonPageFormComponent } from '../import-forms/amazon-page-form/amazon-page-form.component';
import { SipvScraperFormComponent } from '../import-forms/sipv-scraper-form/sipv-scraper-form.component';
import { AmazonWordFormComponent } from '../import-forms/amazon-word-form/amazon-word-form.component';
import { AmazonOrderFormComponent } from '../import-forms/amazon-order-form/amazon-order-form.component';
import { WebsiteScraperFormComponent } from '../import-forms/website-scraper-form/website-scraper-form.component';
import { GetShipmentFormComponent } from '../import-forms/get-shipment-form/get-shipment-form.component';
import { GetDimensionsFormComponent } from '../import-forms/get-dimensions-form/get-dimensions-form.component';
import { AmazonReviewsLiteFormComponent } from '../import-forms/amazon-reviews-lite-form/amazon-reviews-lite-form.component';
import { FbaShipmentsFormComponent } from '../import-forms/fba-shipments-form/fba-shipments-form.component';
import { ManageInventoryFormComponent } from '../import-forms/manage-inventory-form/manage-inventory-form.component';
import { AmzProdIssuesCheckerComponent } from '../import-forms/amz-prod-issues-checker/amz-prod-issues-checker.component';
import { GetTrackingNoComponent } from '../import-forms/get-tracking-no/get-tracking-no.component';
import { PriceDiscountScraperFormComponent } from '../import-forms/price-discount-scraper-form/price-discount-scraper-form.component';

interface Tool {
  name: string;
  subname: string;
  description: string;
  active: boolean;
}

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
  pageInfo: string = '';
  tools: any = [];

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

            this.toolsService.getTools().subscribe(data => {
              this.tools = data.tools.filter((tool: Tool) => tool.active);

              this.handleRouteChange(lastSegment.path);
            });
          } else {
            this.router.navigate(['/tools']);
          }
        });
      }
    });
  }


  getToolInfo(subName: string) {
    return this.tools.find((tool: Tool) => tool.subname === subName).additionalInfo;
  }


  ngAfterViewInit(): void {
    setTimeout(() => this.containerInitialized$.next(true), 0);
  }

  handleRouteChange(path: string): void {
    switch (path) {
      case 'asin-checker-lite-v2':
        this.pageTitle = 'ASIN Checker lite V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(AsinCheckerFormComponent);
        break;

      case 'listing-loader-v2':
        this.pageTitle = 'Listing Loader V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(ListingLoaderFormComponent);
        break;

      case 'listing-issues-v2':
        this.pageTitle = 'Listing Issues V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(ListingIssuesFormComponent);
        break;

      case 'add-product-v2':
        this.pageTitle = 'Add Product V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(AddProductFormComponent);
        break;

      case 'edit-page-v2':
        this.pageTitle = 'Edit Page V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(EditPageFormComponent);
        break;

      case 'edit-page-pricing':
        this.pageTitle = 'Edit Page Pricing';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(EditPagePricingFormComponent);
        break;

      case 'get-parent':
        this.pageTitle = 'Parent ASIN Extractor';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(GetParentFormComponent);
        break;

      case 'amz-id-checker':
        this.pageTitle = 'Amazon Product ID Checker';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(AmzIdCheckerFormComponent);
        break;

      case 'voc-v2':
        this.pageTitle = 'VOC Scraper V2';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(VocScraperFormComponent);
        break;

      case 'prime-exclusive-discount':
        this.pageTitle = 'Prime Exclusive Discounts Scraper';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(PrimeExclusivesFormComponent);
        break;

      case 'sku-extractor':
        this.pageTitle = 'SKU Extractor';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(SkuExtractorFormComponent);
        break;

      case 'sipv-scraper':
        this.pageTitle = 'SIPV Scraper';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(SipvScraperFormComponent);
        break;

      case 'website-scraper':
        this.pageTitle = 'Website Scraper';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(WebsiteScraperFormComponent);
        break;

      case 'amazon-word-detector':
        this.pageTitle = 'Amazon Word Detector';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(AmazonWordFormComponent);
        break;

      case 'get-shipment-items':
        this.pageTitle = 'Get Shipment Items';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(GetShipmentFormComponent);
        break;

      case 'fba-shipments-tracking':
        this.pageTitle = 'FBA Shipments Tracking';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(FbaShipmentsFormComponent);
        break;

      case 'get-dimensions':
        this.pageTitle = 'Get Dimensions';
        this.pageInfo = this.getToolInfo(path);
        this.loadComponent(GetDimensionsFormComponent);
        break;

      case 'amazon-review-v2':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Amazon Review V2';
        this.loadComponent(AmazonReviewsFormComponent);
        break;

      case 'amazon-review-lite':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Amazon Review Lite';
        this.loadComponent(AmazonReviewsLiteFormComponent);
        break;

      case 'amazon-page':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Amazon Page';
        this.loadComponent(AmazonPageFormComponent);
        break;
      case 'amazon-order-scraper':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Amazon Page';
        this.loadComponent(AmazonOrderFormComponent);
        break;
      case 'manage-inventory':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Manage Inventory';
        this.loadComponent(ManageInventoryFormComponent);
        break;
      case '2dt-alternative':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = '2DT Alternative';
        this.loadComponent(AmzProdIssuesCheckerComponent);
        break;
      case 'get-tracking-no':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Get Tracking No.';
        this.loadComponent(GetTrackingNoComponent);
        break;
      case 'price-discount-scraper':
        this.pageInfo = this.getToolInfo(path);
        this.pageTitle = 'Price Discount Scraper';
        this.loadComponent(PriceDiscountScraperFormComponent);
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
