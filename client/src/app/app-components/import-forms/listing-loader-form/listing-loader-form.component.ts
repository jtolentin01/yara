import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { Router } from '@angular/router';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-listing-loader-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './listing-loader-form.component.html',
  styleUrl: './listing-loader-form.component.css'
})
export class ListingLoaderFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private router: Router, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'upc', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'listing-loader-v2' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const productId: string[] = this.importForm.value.productIDs
      .split('\n')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    const productType: string = this.importForm.value.productType;
    const upcLength: number = 12;
    const eanLength: number = 13;

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }
    if (this.importForm.value.productIDs.length === 0) {
      this.toastService.error("Please add product IDs");
      return;
    }

    if (productType === 'upc') {
      const invalidIds: string[] = productId.filter((id: string) => id.length !== upcLength);
      if (invalidIds.length > 0) {
        this.toastService.error(`Some product IDs are invalid: ${invalidIds.join(', ')}. Each UPC must be 12 characters long.`);
        return;
      }
      else {
        this.formUtilsService.submitForm(this.importForm);
        window.location.href = '/downloads';
      }
    }

    if (productType === 'ean') {
      const invalidIds: string[] = productId.filter((id: string) => id.length !== eanLength);
      if (invalidIds.length > 0) {
        this.toastService.error(`Some product IDs are invalid: ${invalidIds.join(', ')}. Each EAN must be 13 characters long.`);
        return;
      }
      else {
        this.formUtilsService.submitForm(this.importForm);
        window.location.href = '/downloads';
      }
    }


  }
}
