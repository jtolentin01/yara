import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-price-discount-scraper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './price-discount-scraper-form.component.html',
  styleUrl: './price-discount-scraper-form.component.css'
})
export class PriceDiscountScraperFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'account', initialValue: 'oe', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'price-discount-scraper' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const promotionId: string[] = this.importForm.value.productIDs
      .split('\n')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (promotionId.length === 0) {
      this.toastService.error("Please add Promotion IDs");
      return;
    } else {
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }

  }
}
