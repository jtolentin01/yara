import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormSubmissionService } from '../../services/form-submission/form-submission.service';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.css'
})

export class AddUserModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitUser = new EventEmitter<any>();

  addUserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formSubmissionService: FormSubmissionService) { }

  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''], 
      department: ['', Validators.required],
      accessLevel: ['', Validators.required],
      role: ['', Validators.required]
    });
  }


  closeModal() {
    this.isVisible = false;
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (this.addUserForm.valid) {
      const userData = this.addUserForm.value;
      this.formSubmissionService.submitNewUser(userData).subscribe(
        (response) => {
          console.log('User successfully added:', response);
          alert('Created successfully: Password sent to user email')
          this.resetForm();
          this.closeModal();
          window.location.reload();
        },
        (error) => {
          this.resetForm();
          console.error('Error adding user:', error);
        }
      );
    }
  }

  private resetForm() {
    this.addUserForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      department: '',
      accessLevel: '',
      role: ''
    });
  }
}