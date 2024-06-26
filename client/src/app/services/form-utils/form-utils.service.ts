import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class FormUtilsService {

  constructor(
    private formBuilder: FormBuilder,
    private formSubmissionService: FormSubmissionService,
    private userDataService: UserDataService
  ) {}

  /**
   * Initialize a dynamic form group based on provided form controls configuration.
   * @param controlsConfig Array of objects defining form controls and their validators.
   * Example: [{ controlName: 'importName', initialValue: '', validators: [Validators.required] }, ...]
   */
  public userDataFromCookies = this.userDataService.getUserDataFromCookies();
  
  public initializeForm(controlsConfig: { controlName: string, initialValue: any, validators?: ValidatorFn[] }[]): FormGroup {
    const formGroupConfig: { [key: string]: any[] } = {};
    
    controlsConfig.forEach(control => {
      formGroupConfig[control.controlName] = [control.initialValue || '', control.validators || []];
    });

    return this.formBuilder.group(formGroupConfig);
  }

  public submitForm(form: FormGroup): void {
    if (form.valid) {
      const formData = { ...form.value };

      if (formData.productIDs) {
        formData.productIDs = formData.productIDs.split('\n').filter((id: string) => id.trim() !== '');
      }

      const additionalData = {
        timestamp: new Date().toISOString(),
      };

      const headers = {
        'Authorization': `Bearer ${this.userDataFromCookies.authorization}`,
      };

      this.formSubmissionService.submitFormData(formData, additionalData, headers).subscribe(
        response => {
          console.log('Form submitted successfully', response);

          const resetConfig = Object.keys(form.controls).reduce((acc, controlName) => {
            acc[controlName] = '';
            return acc;
          }, {} as { [key: string]: any });
          form.reset(resetConfig);
        },
        error => {
          console.error('Error submitting form', error);
        }
      );
    } else {
      console.log('Form is invalid');
      alert('Form is invalid');
    }
  }
}
