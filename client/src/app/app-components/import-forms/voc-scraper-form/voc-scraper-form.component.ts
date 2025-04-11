import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-voc-scraper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './voc-scraper-form.component.html',
  styleUrls: ['./voc-scraper-form.component.css']
})
export class VocScraperFormComponent {
  importForm: FormGroup;
  isSubmitting = false;

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '-', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'voc-v2' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    if (this.importForm.value.importName === '') {
      this.toastService.error('Please add import name');
      return;
    }

    this.isSubmitting = true; 
    this.formUtilsService.submitForm(this.importForm);
    setTimeout(() => {
      window.location.href = '/downloads';
    }, 9000);
  }
}
