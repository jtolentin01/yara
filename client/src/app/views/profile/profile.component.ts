import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserDataService } from '../../services/user-data/user-data.service';
import { AwsS3Service } from '../../services/aws-s3/aws-s3.service';
import { FormSubmissionService } from '../../services/form-submission/form-submission.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

@Component({
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,AngularToastifyModule],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  readonly profileBaseUrl = "https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";
  public isFileUploaded = false;
  public user = this.userDataService.getUserDataFromCookies();
  public profileImg = `${this.profileBaseUrl}${this.user.profile}`;
  selectedFile: File | undefined;
  updatePwForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _toastService: ToastService,
    private userDataService: UserDataService,
    private s3UploadService: AwsS3Service,
    private formSubmissionService: FormSubmissionService
  ) { }

  ngOnInit(): void {
    this.updatePwForm = this.fb.group({
      password: ['', [Validators.required ]],
    })
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        console.log('File size exceeds 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImg = e.target.result;
      };
      reader.readAsDataURL(file);
      this.selectedFile = file;
      this.isFileUploaded = true;
    }
  }

  async uploadFile() {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
    const s3Folder = 'img';
    const fileName = `${this.user.id}`;
    const userData = {
      _id: this.user._id,
      fileName: `${fileName}.jpeg`
    }
    try {
      await this.s3UploadService.uploadFileToS3(s3Folder, this.selectedFile, fileName);
      try {
        this.formSubmissionService.updateProfile(userData).subscribe(response => {
          alert(response.message);
          window.location.reload();
        })
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  onChangePw() {
    const userData = {
      _id: this.user._id,
      password: this.updatePwForm.value.password
    }

    if (this.updatePwForm.valid) {
      if (window.confirm("Do you want to change your password?")) {
        this.formSubmissionService.updatePassword(userData).subscribe(
          (response) => {
            this._toastService.success(response.message);
            setTimeout(()=>{window.location.reload()},3000);
          },
          (error) => {
            console.error('Error adding user:', error);
          }
        );
      }
    }
  }
}
