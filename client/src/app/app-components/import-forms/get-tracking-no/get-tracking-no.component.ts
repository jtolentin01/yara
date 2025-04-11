import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { Router } from '@angular/router';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-get-tracking-no',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './get-tracking-no.component.html',
  styleUrl: './get-tracking-no.component.css'
})
export class GetTrackingNoComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private router: Router, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'carrier', initialValue: 'FedEx', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'get-tracking-no' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    const productId: string[] = this.importForm.value.productIDs
      .split('\n')
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);


    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (productId.length === 0) {
      this.toastService.error("Tracking No. is required");
      return;
    }

    this.formUtilsService.submitForm(this.importForm);
    window.location.href = '/downloads';

  }


}
