import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; 


@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './batch-form.component.html',
  styleUrls: ['./batch-form.component.css']
})
export class BatchFormComponent implements OnInit {
  pageTitle: string = '';
  importForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.importForm = this.formBuilder.group({
      importName: ['', Validators.required],
      productType: ['asin', Validators.required],
      productIDs: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        switch (lastSegment.path) {
          case 'add-product-v2':
            this.pageTitle = 'Add Product V2';
            break;
          case 'asin-checker-v2':
            this.pageTitle = 'ASIN Checker lite V2';
            break;
          case 'listing-loader-v2':
            this.pageTitle = 'Listing Loader V2';
            break;
          default:
            this.pageTitle = 'Undefined';
        }
      }
    });
  }

  submitForm() {
    if (this.importForm.valid) {
      const formData = this.importForm.value;
  
      const productIDsArray = formData.productIDs.split('\n').filter((id: string) => id.trim() !== '');
  
      formData.productIDs = productIDsArray;

      console.log(formData);

      this.importForm.reset({
        importName: '',
        productType: 'asin',
        productIDs: ''
      });
    } else {
      console.log('Form is invalid');
    }
  }
  


}
