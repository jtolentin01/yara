import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormSubmissionService } from '../../services/form-submission/form-submission.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';


@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,AngularToastifyModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.css']
})
export class EditUserModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() user: any;
  @Output() close = new EventEmitter<void>();

  editUserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _toastService: ToastService,
    private formSubmissionService: FormSubmissionService
  ) { }

  ngOnInit(): void {
    this.editUserForm = this.fb.group({
      internalId: [''],
      _id: [''],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      department: ['', Validators.required],
      accessLevel: ['', Validators.required],
      role: ['', Validators.required],
      status: ['', Validators.required]
    });

    if (this.user) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.populateForm();
    }
  }

  populateForm() {
    console.log(this.user);
    if (this.user) {
      this.editUserForm.patchValue(this.user);
    }
  }

  closeModal() {
    this.isVisible = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.editUserForm.valid) {
      const userData = this.editUserForm.value;
      console.log(userData);
      this.formSubmissionService.updateUser(userData).subscribe(
        (response) => {
          if (response.success === true) {
            this.resetForm();
            this.closeModal();
            this._toastService.success(response.message);
            setTimeout(() => {
              window.location.reload();
            }, 2500); 
          } else {
            this._toastService.error(response);
          }
        },
        (error) => {
          this.resetForm();
          console.error('Error adding user:', error);
        }
      );
    }
  }
  

  private resetForm() {
    this.editUserForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      department: '',
      accessLevel: '',
      role: '',
      status: ''
    });
  }
}
