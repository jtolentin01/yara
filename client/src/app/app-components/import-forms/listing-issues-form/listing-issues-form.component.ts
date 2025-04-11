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

interface Issue {
  formControlName: string;
  label: string;
  severity: 'Low' | 'Medium' | 'High';
  checked: boolean;
}

@Component({
  selector: 'app-listing-issues-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule],
  templateUrl: './listing-issues-form.component.html',
  styleUrls: ['./listing-issues-form.component.css'],
})
export class ListingIssuesFormComponent {
  importForm: FormGroup;
  posts: Issue[] = [
    {
      formControlName: 'inactiveBlockedRed',
      label: 'Inactive Blocked-Red',
      severity: 'Low',
      checked: false,
    },
    {
      formControlName: 'inactiveBlockedYellow',
      label: 'Inactive Blocked-Yellow',
      severity: 'Low',
      checked: false,
    },
    {
      formControlName: 'pricingIssues',
      label: 'Pricing Issues',
      severity: 'Medium',
      checked: false,
    },
    {
      formControlName: 'closed',
      label: 'Closed',
      severity: 'Medium',
      checked: false,
    },
    {
      formControlName: 'startDateInFuture',
      label: 'Start Date in Future',
      severity: 'Low',
      checked: false,
    },
    {
      formControlName: 'detailPageRemoved',
      label: 'Detail Page Removed',
      severity: 'Medium',
      checked: false,
    },
    {
      formControlName: 'approvalRequired',
      label: 'Approval Required',
      severity: 'High',
      checked: false,
    },
    {
      formControlName: 'combineIntoSingleSheet',
      label: 'Combine into Single Sheet (Optional)',
      severity: 'Low',
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
      inactiveBlockedRed: [false],
      inactiveBlockedYellow: [false],
      pricingIssues: [false],
      closed: [false],
      startDateInFuture: [false],
      detailPageRemoved: [false],
      approvalRequired: [false],
      combineIntoSingleSheet: [false],
      marketPlace: ['US', Validators.required],
      tool: "listing-issues-v2",
    });

    this.importForm.valueChanges.subscribe(() => {
      const areAllSelected = this.areAllIssuesSelected();
      const selectAllControl = this.importForm.get('selectAll');
      if (selectAllControl && areAllSelected !== selectAllControl.value) {
        selectAllControl.setValue(areAllSelected, { emitEvent: false });
      }
    });
  }

  checkAllCheckBox(ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.posts
      .filter((x) => x.formControlName !== 'combineIntoSingleSheet')
      .forEach((x) => {
        x.checked = checked;
        this.importForm.get(x.formControlName)?.setValue(checked, { emitEvent: false });
      });
    this.importForm.get('combineIntoSingleSheet')?.setValue(false, { emitEvent: false });
  }

  updateFormWithPosts(): void {
    this.posts.forEach((post) => {
      this.importForm.get(post.formControlName)?.setValue(post.checked, {
        emitEvent: false,
      });
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

  submitForm(): void {
    const areIssuesSelected = this.posts
      .filter((post) => post.formControlName !== 'combineIntoSingleSheet')
      .some((post) => this.importForm.get(post.formControlName)?.value);

    if (this.importForm.value.importName === "") {
      this.toastService.error("Please add import name");
      return;
    }

    if (!areIssuesSelected) {
      this.toastService.error('Please select at least one issue.');
      return;
    }


    if (this.importForm) {
      this.formUtilsService.submitFormS1(this.importForm.value);
      window.location.href = '/downloads';
      // this.router.navigate(['/downloads']);
    }
  }
}
