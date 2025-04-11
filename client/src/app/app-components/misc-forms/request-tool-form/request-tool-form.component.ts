import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormMscService } from '../../../services/form-msc/form-msc.service';

@Component({
  selector: 'app-request-tool-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  
  templateUrl: './request-tool-form.component.html',
  styleUrl: './request-tool-form.component.css'
})
export class RequestToolFormComponent {
  @Output() formClose = new EventEmitter<void>();
  importForm: FormGroup;
  constructor(private formUtilsService: FormMscService) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'fsrType', initialValue: 'request', validators: [Validators.required] },
      { controlName: 'message', initialValue: '', validators: [Validators.required] },
    ]);
  }
  submitForm(): void {
    this.formUtilsService.submitForm(this.importForm);
    this.formClose.emit();
    this.importForm.reset();
    
  }
}
