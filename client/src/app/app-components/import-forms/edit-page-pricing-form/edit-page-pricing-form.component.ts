import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-edit-page-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './edit-page-pricing-form.component.html',
  styleUrl: './edit-page-pricing-form.component.css'
})
export class EditPagePricingFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'skuAsins', initialValue: '', validators: [Validators.required] },
      { controlName: 'account', initialValue: 'oe', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'edit-page-pricing' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (this.importForm.value.skuAsins.length === 0) {
      this.toastService.error("Please add SKUs");
      return;
    }
    else {
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }

  }
}
