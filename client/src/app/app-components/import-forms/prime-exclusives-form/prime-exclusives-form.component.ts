import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-prime-exclusives-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './prime-exclusives-form.component.html',
  styleUrl: './prime-exclusives-form.component.css'
})
export class PrimeExclusivesFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'account', initialValue: 'oe', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'prime-exclusive-discount' },
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
      this.toastService.error("Please add alteast 1 promotion ID");
      return;
    }
    else{
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }
  }
}
