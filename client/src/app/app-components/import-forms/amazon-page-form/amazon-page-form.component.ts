import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-amazon-page-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './amazon-page-form.component.html',
  styleUrl: './amazon-page-form.component.css'
})
export class AmazonPageFormComponent {
  importForm: FormGroup;
  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'priceInclude', initialValue: false },
      { controlName: 'tool', initialValue: 'amazon-page' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }
  submitForm(): void {
    if (this.importForm.valid) {

      const productId: string[] = this.importForm.value.productIDs
        .split('\n')
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);
      if (productId.length > 1000) {
        this.toastService.warn("Exceeded the maximum number of imported ASINS (1000)");
        return;
      }
      else {
        this.formUtilsService.submitForm(this.importForm);
        window.location.href = '/downloads';
      }
    }
    else {
      this.toastService.error('Please complete the form');
    }

  }
}
