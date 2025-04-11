import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormSubmissionService } from '../../services/form-submission/form-submission.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,AngularToastifyModule],
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
    private _toastService: ToastService,
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
          if(response.success){
            this._toastService.success('successfully created!');
            this.resetForm;
            setTimeout(()=>{window.location.reload()},2000);
          }
          else{
            this._toastService.error(response.message);
          }

        },
        (error) => {
          this.resetForm();
          this._toastService.error(error);
        }
      );
    }
  }

  private resetForm() {
    this.addUserForm.reset();
  }
}