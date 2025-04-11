import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { Router } from '@angular/router';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-sku-extractor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './sku-extractor-form.component.html',
  styleUrl: './sku-extractor-form.component.css'
})
export class SkuExtractorFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private router: Router, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'account', initialValue: 'oe' },
      { controlName: 'tool', initialValue: 'sku-extractor' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (this.importForm.value.productIDs === "") {
      this.toastService.error("Please add atleast one SKU");
      return;
    }
    else{
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }

  }

}
