import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-amz-id-checker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './amz-id-checker-form.component.html',
  styleUrl: './amz-id-checker-form.component.css'
})
export class AmzIdCheckerFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'amz-id-checker' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const productId: string[] = this.importForm.value.productIDs
      .split('\n')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0); 

    const productType: string = this.importForm.value.productType;
    const asinLength: number = 10;

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (productId.length === 0) {
      this.toastService.error("Please add product IDs");
      return;
    }

    if (productType === 'asin') {
      const invalidIds: string[] = productId.filter((id: string) => id.length !== asinLength);
      if (invalidIds.length > 0) {
        this.toastService.error(`Some product IDs are invalid: ${invalidIds.join(', ')}. Each ASIN must be 10 characters long.`);
        return;
      }
      else {
        this.formUtilsService.submitForm(this.importForm);
        window.location.href = '/downloads';
      }
    }

  }

}
