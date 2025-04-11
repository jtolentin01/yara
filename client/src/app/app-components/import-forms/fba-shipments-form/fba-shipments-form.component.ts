import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-fba-shipments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './fba-shipments-form.component.html',
  styleUrl: './fba-shipments-form.component.css'
})
export class FbaShipmentsFormComponent {
  importForm: FormGroup;
  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'fba-shipments-tracking' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    if (this.importForm.valid) {
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }
    else {
      this.toastService.error('Please complete the form');
    }
  }
}
