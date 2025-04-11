import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-amz-prod-issues-checker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './amz-prod-issues-checker.component.html',
  styleUrl: './amz-prod-issues-checker.component.css'
})
export class AmzProdIssuesCheckerComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: '2dt-alternative' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const { productIDs, importName }: { productIDs: string; productType: string; importName: string } = this.importForm.value;
    const productId: string[] = productIDs.split('\n').map((id: string) => id.trim()).filter(Boolean);
  
    if (!importName) return this.toastService.error("Please add import name");
    if (productId.length === 0) return this.toastService.error("SKU is required");
  
    this.formUtilsService.submitForm(this.importForm);
    window.location.href = '/downloads';
  }

}
