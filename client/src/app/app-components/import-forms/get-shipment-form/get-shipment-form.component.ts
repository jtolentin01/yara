import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-get-shipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './get-shipment-form.component.html',
  styleUrl: './get-shipment-form.component.css'
})
export class GetShipmentFormComponent {
  importForm: FormGroup;
  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'get-shipment-items' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    if(this.importForm.valid){
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
    }
    else{
      this.toastService.error('Please complete the form');
    }
  }
}
