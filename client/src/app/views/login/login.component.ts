import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { UserDataService } from "../../services/user-data/user-data.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginform: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private userService: UserDataService,
  ) {
    this.loginform = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    const storedEmail = localStorage.getItem('user');
    if (storedEmail) {
      this.loginform.patchValue({ email: storedEmail });
    }
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
          if(response.authorization){
            this.userService.setUserDataInCookies(response)
            this.loginform.reset();
            window.location.reload();
          }
        },
        (error) => {
          console.error("Error:", error);
          alert("Failed to submit data");
          this.loginform.reset();
        }
      );
    }
    else{
      alert('Something Went Wrong!');
      this.loginform.reset();
    }
  };
}
