import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { UserDataService } from "../../services/user-data/user-data.service";
import { FormSubmissionService } from "../../services/form-submission/form-submission.service";
import { response } from "express";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AngularToastifyModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  readonly oeLogo = "../../../assets/bg-a.jpg"
  loginform: FormGroup;
  signupform: FormGroup;
  newpwform: FormGroup;
  isLoginMode = true;
  isForgotPasswordMode = false;
  passwordVisible = false;
  readonly tempId = localStorage.getItem('t_id') ? localStorage.getItem('t_id') : "novalue";
  readonly tempEmail = localStorage.getItem('t_email') ? localStorage.getItem('t_email') : "novalue";

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private userService: UserDataService,
    private _toastService: ToastService,
    private formSubmissionService : FormSubmissionService
  ) {
    this.loginform = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });

    this.signupform = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      department: ['', Validators.required],
      accessLevel: ['1'],
      role: ['Analyst'],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.newpwform = this.formBuilder.group({
      _id: [this.tempId],
      emailVal: [{value: this.tempEmail, disabled: true}, [Validators.required, Validators.email]],
      email: [this.tempEmail],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
    });

  }
  

  ngOnInit(): void {
    const storedEmail = localStorage.getItem('user');
    if (storedEmail && this.isLoginMode) {
      this.loginform.patchValue({ email: storedEmail });
    }
  }

  updatePassword() {
    if (this.newpwform.valid) {
      if(this.newpwform.value.password === this.newpwform.value.confirmPassword){
        this.formSubmissionService.updatePasswordNoAuth(this.newpwform.value).subscribe(
          (response) => {
            if(response.success){
              this._toastService.success('Succesfully updated! Please login');
              localStorage.removeItem('t_email');
              localStorage.removeItem('t_id');
              this.newpwform.reset();
              setTimeout(()=>{window.location.reload()},3000);
            }
            else{
              this._toastService.error(response.message);
            }
          },
          (error) => {
            this._toastService.error(`error occured! - ${error}`);
          }
        );
      }
      else{
        this._toastService.error('Passwords do not match');
      }
      
    } else {
      this._toastService.error('Invalid Signup');
    }
  }
  
  toggleLoginMode(event: Event) {
    event.preventDefault();
    this.isLoginMode = !this.isLoginMode;
    this.isForgotPasswordMode = false;
    this.resetForm();
  }


  toggleMode = (): void => {
    this.isLoginMode = !this.isLoginMode;
    this.loginform.reset();
  }

  showPassword = (): void => {
    this.passwordVisible = !this.passwordVisible;
    const passwordField: HTMLInputElement | null = document.querySelector('#password');
    if (passwordField) {
      passwordField.type = this.passwordVisible ? 'text' : 'password';
    }
  }

  login = (): void => {
    if (this.loginform.valid) {
      this.authService.submitFormData(this.loginform.value).subscribe(
        
        (response) => {
          if (response.secureAccess === false) {
            localStorage.setItem('t_id', response.user._id);
            localStorage.setItem('t_email', response.user.email);
            this.loginform.reset();
            this._toastService.warn('Please change your password');
            this.isForgotPasswordMode = true;
            this.isLoginMode = false;
          } else if (response.user) {
            this.userService.setUserDataInCookies(response.user);
            this.loginform.reset();
            window.location.reload();
          } else {
            this._toastService.error('Wrong email or password');
          }
        },
        (error) => {
          this._toastService.error('an error occured!');
        }
      );
    } else {
      this._toastService.error('Something went wrong!');
      this.loginform.reset();
    }
  };

  signup() {
    if (this.signupform.valid) {
      if(this.signupform.value.password === this.signupform.value.confirmPassword){
        this.formSubmissionService.submitNewUserNoAuth(this.signupform.value).subscribe(
          (response) => {
            if(response.success){
              this.resetSignupForm();
              this._toastService.success('succesfully created, Please Login');
              setTimeout(()=>{window.location.reload()},3000);
            }
            else{
              this._toastService.error(response.message);
            }
          },
          (error) => {
            this._toastService.error(`error occured! - ${error}`);
          }
        );
      }
      else{
        this._toastService.error('Passwords do not match');
      }
      
    } else {
      this._toastService.error('Invalid Signup');
    }
  }

  toggleForgotPasswordMode(event: Event) {
    event.preventDefault();
    this.isForgotPasswordMode = true;
    this.isLoginMode = false;
    this.resetForm();
  }

  resetForm() {
    this.loginform.reset();
  }

  resetSignupForm() {
    this.signupform.reset();
  }

  resetRecoveryForm() {
    this.signupform.reset();
  }
}
