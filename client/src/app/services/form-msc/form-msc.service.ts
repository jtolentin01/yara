import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { UserDataService } from '../user-data/user-data.service';
import { Observable,of } from 'rxjs';
import { FormSubmissionService } from '../form-submission/form-submission.service';


@Injectable({
  providedIn: 'root'
})
export class FormMscService {

  constructor(
    private formSubmission: FormSubmissionService,
    private formBuilder: FormBuilder,
    private userDataService: UserDataService,
  ) { }

  /**
   * @param controlsConfig
  */
  public userDataFromCookies = this.userDataService.getUserDataFromCookies();
  public initializeForm(controlsConfig: { controlName: string, initialValue: any, validators?: ValidatorFn[] }[]): FormGroup {
    const formGroupConfig: { [key: string]: any[] } = {};
    
    controlsConfig.forEach(control => {
      formGroupConfig[control.controlName] = [control.initialValue || '', control.validators || []];
    });

    return this.formBuilder.group(formGroupConfig);
  }

  submitForm(form: FormGroup){
    const formData = { ...form.value };
    if (form.valid) {
      return this.formSubmission.submitFsr(formData).subscribe(response=>{
        null;
      })
    } else {
      alert('Error Occured!');
      return of(null);
    }
  }

}
