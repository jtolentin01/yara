import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';

interface ProductPolicy {
  formControlName: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-sipv-scraper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './sipv-scraper-form.component.html',
  styleUrl: './sipv-scraper-form.component.css'
})
export class SipvScraperFormComponent {
  importForm: FormGroup;
  
  posts: ProductPolicy[] = [
    {
      formControlName: 'AUTOMATED_BRAND_PROTECTION',
      label: 'Suspected Intellectual Property Violations',
      checked: false,
    },
    {
      formControlName: 'IntellectualProperty',
      label: 'Received Intellectual Property Complaints',
      checked: false,
    },
    {
      formControlName: 'POSITIVE_CUSTOMER_EXPERIENCE',
      label: 'Other Policy Violations',
      checked: false,
    },
    {
      formControlName: 'ProductCondition',
      label: 'Product Condition Customer Complaints',
      checked: false,
    },
    {
      formControlName: 'ProductSafety',
      label: 'Food and Product Safety Issues',
      checked: false,
    },
    {
      formControlName: 'RESTRICTED_PRODUCTS',
      label: 'Restricted Product Policy Violations',
      checked: false,
    },
    {
      formControlName: 'ListingPolicy',
      label: 'Listing Policy Violations',
      checked: false,
    },
    {
      formControlName: 'ProductComplianceRequest',
      label: 'Product Compliance Request',
      checked: false,
    },
  ];
  constructor(
    private formUtilsService: FormUtilsService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.importForm = this.fb.group({
      importName: ['', [Validators.required, Validators.maxLength(20)]],
      selectAll: [false],
      AUTOMATED_BRAND_PROTECTION: [false],
      IntellectualProperty: [false],
      POSITIVE_CUSTOMER_EXPERIENCE: [false],
      ProductCondition: [false],
      ProductSafety: [false],
      RESTRICTED_PRODUCTS: [false],
      ListingPolicy: [false],
      ProductComplianceRequest: [false],
      marketPlace: ['US', Validators.required],
      tool: "sipv-scraper",
    });

    this.importForm.valueChanges.subscribe(() => {
      const areAllSelected = this.areAllIssuesSelected();
      const selectAllControl = this.importForm.get('selectAll');
      if (selectAllControl && areAllSelected !== selectAllControl.value) {
        selectAllControl.setValue(areAllSelected, { emitEvent: false });
      }
    });
  }

  onIndividualCheckBoxChange(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.posts[index].checked = checked;
    this.importForm
      .get(this.posts[index].formControlName)
      ?.setValue(checked, { emitEvent: false });

    const selectAllControl = this.importForm.get('selectAll');
    if (selectAllControl) {
      selectAllControl.setValue(this.isAllCheckBoxChecked(), {
        emitEvent: false,
      });
    }
  }

  isAllCheckBoxChecked(): boolean {
    return this.posts
      .filter((p) => p.formControlName !== 'combineIntoSingleSheet')
      .every((p) => p.checked);
  }

  areAllIssuesSelected(): boolean {
    const formValues = this.importForm.value;
    return this.posts
      .filter((post) => post.formControlName !== 'combineIntoSingleSheet')
      .every((post) => formValues[post.formControlName]);
  }

  checkAllCheckBox(ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.posts
      .filter((x) => x.formControlName !== 'combineIntoSingleSheet')
      .forEach((x) => {
        x.checked = checked;
        this.importForm.get(x.formControlName)?.setValue(checked, { emitEvent: false });
      });
  }

  submitForm(): void {
    const areIssuesSelected = this.posts
      .filter((post) => post.formControlName !== 'combineIntoSingleSheet')
      .some((post) => this.importForm.get(post.formControlName)?.value);

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (!areIssuesSelected) {
      this.toastService.error('Please select at least one policy.');
      return;
    }

    if (this.importForm) {
      this.formUtilsService.submitFormS1(this.importForm.value)
      window.location.href = '/downloads';
    }
  }

  
  
}
