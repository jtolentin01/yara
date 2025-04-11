import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-get-dimensions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './get-dimensions-form.component.html',
  styleUrl: './get-dimensions-form.component.css'
})
export class GetDimensionsFormComponent {
  importForm: FormGroup;
  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'get-dimensions' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const { productIDs, productType, importName }: { productIDs: string; productType: string; importName: string } = this.importForm.value;
    const productId: string[] = productIDs.split('\n').map((id: string) => id.trim()).filter(Boolean);
  
    const lengthMap: { [key: string]: number } = { asin: 10, upc: 12, ean: 13 };
    const invalidIds: string[] = productId.filter((id: string) => id.length !== lengthMap[productType]);
  
    if (!importName) return this.toastService.error("Please add import name");
    if (productId.length === 0) return this.toastService.error("Please add product IDs");
  
    if (invalidIds.length > 0) {
      return this.toastService.error(
        `Some product IDs are invalid: ${invalidIds.join(', ')}. Each ${productType.toUpperCase()} must be ${lengthMap[productType]} characters long.`
      );
    }
  
    this.formUtilsService.submitForm(this.importForm);
    window.location.href = '/downloads';
  }
  
  
}