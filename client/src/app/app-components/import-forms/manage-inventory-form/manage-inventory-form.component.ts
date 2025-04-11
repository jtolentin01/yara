import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { Router } from '@angular/router';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-manage-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './manage-inventory-form.component.html',
  styleUrl: './manage-inventory-form.component.css'
})
export class ManageInventoryFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService, private router: Router, private toastService: ToastService,) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'brand', initialValue: '' },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'manage-inventory' },
      { controlName: 'status', initialValue: 1 },
    ]);

  }

  submitForm(): void {
    if (this.importForm.valid) {
      this.formUtilsService.submitForm(this.importForm);
      window.location.href = '/downloads';
      
    } else {
      this.toastService.error('Invalid! please complete the form');
    }
  }
}
