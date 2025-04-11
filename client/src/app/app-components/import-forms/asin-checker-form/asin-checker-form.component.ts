import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { Router } from '@angular/router';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-asin-checker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './asin-checker-form.component.html',
  styleUrls: ['./asin-checker-form.component.css']
})
export class AsinCheckerFormComponent implements OnInit {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private router: Router, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'includeSku', initialValue: false },
      { controlName: 'account', initialValue: 'oe' },
      { controlName: 'tool', initialValue: 'asin-checker-lite-v2' },
      { controlName: 'status', initialValue: 1 },
    ]);

  }

  ngOnInit(): void {
    this.importForm.get('account')?.disable();
    this.importForm.get('includeSku')?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        this.importForm.get('account')?.enable(); 
      } else {
        this.importForm.get('account')?.disable(); 
      }
    });
  }
  
  submitForm(): void {
    const productId: string[] = this.importForm.value.productIDs
      .split('\n')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0); 

    const productType: string = this.importForm.value.productType;
    const asinLength: number = 10;
    const upcLength: number = 12;

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

  }

}
