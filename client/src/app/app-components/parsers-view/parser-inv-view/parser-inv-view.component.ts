import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { ModalComponent } from '../../modal/modal.component';
import { ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule, FormBuilder } from '@angular/forms';
import { ToolsService } from '../../../services/tools-list/tools.service';
import { FormSubmissionService } from '../../../services/form-submission/form-submission.service';
import { AwsS3Service } from '../../../services/aws-s3/aws-s3.service';
import { BatchesService } from '../../../services/batches/batches.service';

interface TableRow {
  _id: string;
  dateImported: string;
  importBy: string;
  batchId: string;
  brand: string;
  status: string;
  info: [];
  selected: false,
  downloadkey: string;
}

interface Brands {
  brandcode: string;
  brandname: string;
}

@Component({
  selector: 'app-parser-inv-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule, ModalComponent, FormsModule],
  templateUrl: './parser-inv-view.component.html',
  styleUrl: './parser-inv-view.component.css'
})
export class ParserInvViewComponent implements OnInit {
  tableData: TableRow[] = [];
  importForm: FormGroup;
  isModalOpen: boolean = false;
  selectedFileName: string = '';
  newFileName: string = '';
  file: any;
  brands: Brands[] = [];
  items: number = 15;
  page: number = 1;
  filter: string = "";
  category: string = "";
  totalBatches: number = 0;
  isProcessing: boolean = false;

  constructor(
    private toastService: ToastService,
    private toolsService: ToolsService,
    private formSubmissionService: FormSubmissionService,
    private awsService: AwsS3Service,
    private batchesService: BatchesService) {
    this.importForm = new FormGroup({
      parser: new FormControl('parser-inv', Validators.required),
      importType: new FormControl('', Validators.required),
      filename: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.toolsService.getParsers().subscribe((response) => {
      this.brands = response.parsers.filter((parser: any) => parser.subname == 'parser-inv').flatMap((parser: any) => {
        return parser.brands;
      });
    });
    this.fetchBatches();
  }

  fetchBatches() {
    this.batchesService.getParserBatches(this.items, this.page, this.filter, this.category).subscribe((response) => {
      this.updateTableData(response);
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  import(): void {
    this.isModalOpen = true;
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
    const extension = this.file.name.split('.').pop();
    if (this.file) {
      this.selectedFileName = this.file.name;

      this.newFileName = `${[...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}.${extension}`;
      this.importForm.patchValue({
        filename: this.newFileName
      });
    }
  }

  async submitForm() {
    this.isProcessing = true;
    if (this.importForm.valid) {
      try {
        await this.awsService.uploadFile('imports-parser', this.file, this.newFileName);
        this.formSubmissionService.submitNewRequest(this.importForm.value).subscribe((response) => {
          if (response.success == true) {
            this.fetchBatches();
            this.toastService.success('Parsed Successfully');
            this.closeModal();
            this.isProcessing = false;
            this.importForm.reset();
          }
          else {
            this.closeModal();
            this.toastService.error('Something went wrong');
            this.isProcessing = false;
            this.importForm.reset();
          }
        })
      } catch (error) {
        this.toastService.error(`something went wrong!`);
        this.isProcessing = false;
      }


    } else {
      this.toastService.error('Invalid Form');
      this.isProcessing = false;
    }
  }

  updateTableData(response: any): void {
    this.tableData = response.batch.map((batch: any) => ({
      _id: batch._id,
      dateImported: new Date(batch.createdAt).toLocaleString(),
      importBy: `${batch.createdby.firstname} ${batch.createdby.lastname}`,
      batchId: batch.batchid,
      brand: batch.importType,
      status: batch.status == 3 ? 'Completed' : '',
      downloadkey: batch.downloadKey,
      info: batch.info,
      selected: false
    }));
    this.totalBatches = response.totalBatches;
  }

  download(key: any): void {
    const downloadLink = document.createElement("a");
    downloadLink.href = key;
    downloadLink.target = "_blank";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  deleteBatch(batchid: any): void {
    if (window.confirm(`Are you sure you want to delete batch ${batchid}?`)) {
      this.batchesService.deleteParserBatch(batchid).subscribe((response) => {
        if (response.success == true) {
          this.toastService.success(`Batch ${batchid} deleted successfully!`);
          this.fetchBatches();
        }
        else {
          this.toastService.error(`Something went wrong!`);
        }
      })
    }
  }


}
