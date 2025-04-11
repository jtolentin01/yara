import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { ToolsService } from '../../../services/tools-list/tools.service';

interface Scrapers {
  name: string;
  subname: string;
  active: boolean;
}

interface ScraperGroup {
  price: Scrapers[];
  inventory: Scrapers[];
}

@Component({
  selector: 'app-website-scraper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './website-scraper-form.component.html',
  styleUrl: './website-scraper-form.component.css'
})
export class WebsiteScraperFormComponent implements OnInit {
  importForm: FormGroup;
  priceScrapers: any = [];
  inventoryScrapers: any = [];
  displayedScrapers: Scrapers[] = [];

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService, private toolsService: ToolsService) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'scraper', initialValue: '', validators: [Validators.required] },
      { controlName: 'type', initialValue: 'inventory', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'website-scraper' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  ngOnInit(): void {
    this.toolsService.getScrapers().subscribe(data => {
      this.priceScrapers = data.scrapers.flatMap((scraper: ScraperGroup) =>
        scraper.price.filter((p: Scrapers) => p.active)
      );
      this.inventoryScrapers = data.scrapers.flatMap((scraper: ScraperGroup) =>
        scraper.inventory.filter((i: Scrapers) => i.active)
      );

      this.updateScrapers(this.importForm.get('type')?.value);
    });

    this.importForm.get('type')?.valueChanges.subscribe((selectedType: string) => {
      this.updateScrapers(selectedType);
    });
  }

  updateScrapers(selectedType: string): void {
    if (selectedType === 'inventory') {
      this.displayedScrapers = this.inventoryScrapers;
    } else {
      this.displayedScrapers = this.priceScrapers;
    }
  }

  submitForm(): void {
    if (this.importForm.value.productIDs === "" || this.importForm.value.scraper === "") {
      this.toastService.error("Please complete the form");
      return;
    }
    else{
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }
  }
}
