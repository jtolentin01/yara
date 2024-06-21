import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';

@Component({
  selector: 'app-asin-checker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asin-checker-form.component.html',
  styleUrls: ['./asin-checker-form.component.css']
})
export class AsinCheckerFormComponent {
  importForm: FormGroup;

  constructor(private formUtilsService: FormUtilsService) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'asin-checker-v2' },
      { controlName: 'status', initialValue: 1 },
    ]);
  }

  submitForm(): void {
    this.formUtilsService.submitForm(this.importForm);
  }
}
