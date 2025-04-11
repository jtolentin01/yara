import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { BatchesService } from "../../services/batches/batches.service";
import { WebSocketService } from "../../services/web-socket/web-socket.service";
import { UserDataService } from "../../services/user-data/user-data.service";
import { ToolsService } from "../../services/tools-list/tools.service";
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { ExternalServicesService } from "../../services/external-services/external-services.service";

interface TableRow {
  _id: string;
  profile: string;
  internalId: number;
  selected: boolean;
  dateImported: string;
  dateUpdated: string;
  batchName: any;
  importBy: string;
  batchId: string;
  importNameTool: string;
  progress: number;
  status: string;
  batchStatus: number,
  statusClass: any;
  totalItems: number;
  info: [];
  hidden?: boolean;
}
interface User {
  internalId: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  profile: string;
}

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, FormsModule, AngularToastifyModule],
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit {
  tableData: TableRow[] = [];
  sortColumn: string | null = null;
  sortDirection: "asc" | "desc" = "asc";
  searchTerm: string = "";
  items: number = 15;
  page: number = 1;
  totalBatches: number = 0;
  filter: string = "";
  status: string = "";
  category: string = "";
  toggleChecked: boolean = localStorage.getItem('showallbatches') === 'true';
  tools: any = {};
  isProgress: boolean = false;
  activeUsers: User[] = [];
  readonly profileBaseUrl = "https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";

  constructor(
    private _toastService: ToastService,
    private batchesService: BatchesService,
    private websocketService: WebSocketService,
    private userDataService: UserDataService,
    private toolsService: ToolsService,
    private route: ActivatedRoute,
    private router: Router,
    private externalServices: ExternalServicesService
  ) { }

  public batchMonitoringData = {
    reqType: 2,
    reqBody: {
      active: true,
    },
  };

  public user = localStorage.getItem('showallbatches') === 'true' ? " " : this.userDataService.getUserDataFromCookies();

  ngOnInit(): void {
    this.updateToggle();

    this.route.queryParams.subscribe(params => {
      const pageParam = params['page'];

      if (!pageParam) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { page: 1, filter: params['filter'] || '', category: params['category'] || '' || '', status: params['status'] || '' },
          queryParamsHandling: 'merge',
        });
        return;
      }

      this.page = !isNaN(pageParam) && +pageParam > 0 ? +pageParam : 1;
      this.filter = params['filter'] || '';
      this.category = params['category'] || '';
      this.status = params['status'] || '';

      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    });

    this.websocketService.connectSocket();
    this.websocketService.sendMessage({
      reqType: 2,
      reqBody: { active: true },
    });

    this.websocketService.receiveMessages().subscribe((message) => {
      if (message.updatedBatchId) {
        const batchToUpdate = this.tableData.find((batch) => batch._id === message.updatedBatchId);
        if (batchToUpdate) {
          batchToUpdate.progress = message.progress;
          batchToUpdate.status = message.progress === 100 ? `Completed` : `Ongoing`;
          if (message.progress === 100) {
            setTimeout(() => {
              this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
            }, 6000);
          }
        }
      } else if (message.new) {
        this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
      }
    });

    this.websocketService.listenForActiveClient().subscribe((activeClient) => {
      this.activeUsers = activeClient;
    });

    this.toolsService.getTools().subscribe(data => {
      this.tools = data;
    });
  }


  fetchOrSearchBatches(items: any, page: any, filter: any, category: any, userid: any): void {
    if (this.searchTerm) {
      this.batchesService.searchBatch(items, page, this.searchTerm).subscribe((response) => {
        this.updateTableData(response);
      });
    } else {
      this.batchesService.getBatches(items, page, filter, category, userid).subscribe((response) => {
        this.updateTableData(response);
      });
    }
  }

  updateTableData(response: any): void {
    this.tableData = response.batch.map((batch: any) => ({
      _id: batch._id,
      internalId: batch.requestorid,
      profile: `${this.profileBaseUrl}${batch.requestorid}.jpeg`,
      selected: false,
      dateImported: new Date(batch.createdAt).toLocaleString(),
      dateUpdated: new Date(batch.updatedAt).toLocaleString(),
      importBy: batch.requestorname,
      batchId: batch.batchid,
      importNameTool: batch.tool,
      batchName: batch.batchname,
      progress: batch.progress,
      totalItems: batch.totalitems,
      info: batch.info,
      batchStatus: batch.status,
      status: batch.progress === 100 ?
        `Completed` :
        (batch.status === 2 ? 'View Error' : 'Ongoing'),

      statusClass: batch.progress === 100 ?
        "bg-green-200 text-green-800" :
        (batch.status === 2 ? "bg-red-200 text-red-800 hover:cursor-pointer" : "bg-yellow-200 text-yellow-800"),

      hidden: false,
    }));
    this.totalBatches = response.totalBatches;
  }

  deleteBatch(batchId: string): void {
    if (confirm(`Are you sure you want to delete batch ${batchId}`)) {
      this.batchesService.deleteBatch(batchId).subscribe(
        (response) => {
          if (response.batchId == batchId) {
            this._toastService.success(`Batch: ${batchId} Succesfully Deleted!`);
            this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
          }
        },
        (error) => {
          console.error("Error deleting batch", error);
          this._toastService.error(error);
        }
      );
    }
  }

  toggleAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    this.tableData.forEach((row) => {
      row.selected = isChecked;
    });
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }

    this.tableData.sort((a, b) => {
      let valueA = a[column as keyof TableRow];
      let valueB = b[column as keyof TableRow];

      if (typeof valueA === "string" && typeof valueB === "string") {
        if (this.sortDirection === "asc") {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }

      return 0;
    });
  }

  applySearch(): void {
    this.updateQueryParams(true);
    this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id);
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.page = page;
      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id);
    }
  }

  nextPage(): void {
    if (this.page * this.items < this.totalBatches) {
      this.page++;
      this.updateQueryParams(false);
      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.updateQueryParams(false);
      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    }
  }

  private updateQueryParams(resetPage: boolean): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: resetPage === false ? this.page : 1, filter: this.filter, category: this.category, status: this.status },
      queryParamsHandling: 'merge',
    });
  }

  setShowAllBatches = (): void => {
    const showAllBatches = localStorage.getItem('showallbatches') === 'true';
    localStorage.setItem('showallbatches', showAllBatches ? 'false' : 'true');
    this.updateToggle();
    window.location.reload();

  }

  updateToggle(): void {
    this.toggleChecked = localStorage.getItem('showallbatches') === 'true';
  }

  get totalPages(): number {
    return Math.ceil(this.totalBatches / this.items);
  }

  getProgressBarColor(progress: number): string {
    if (progress <= 10) return "#FFEB3B";
    if (progress <= 20) return "#FFDD33";
    if (progress <= 30) return "#FFCC33";
    if (progress <= 40) return "#FFBB33";
    if (progress <= 50) return "#FFAA33";
    if (progress <= 60) return "#FFA533";
    if (progress <= 70) return "#FF9933";
    if (progress <= 80) return "#FF8A33";
    if (progress <= 90) return "#FF7A33";
    if (progress <= 100) return "#4CAF50";
    return "#FFEB3B";
  }

  downloadResult(batchId: string, progress: number): void {
    if (progress < 100) {
      return;
    }

    const url = `https://yara-web.s3.ap-southeast-2.amazonaws.com/downloads/${batchId}.xlsx`;
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.target = "_blank";
    downloadLink.download = `${batchId}.xlsx`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  resubmitBatch(batchId: string): void {
    if (confirm(`Are you sure you want to resubmit batch ${batchId}`)) {
      this._toastService.success(`Batch: ${batchId} succesfully resubmitted!`);
      this.batchesService.resubmitBatch(batchId).subscribe(
        response => {
        }
      );
    }
  }

  viewError(info: { error: string }[]): void {
    const errors = info.map(item => item.error) || 'unknown error'
    const errorMessage = errors.join('\n');
    this._toastService.error(errorMessage ? errorMessage : 'unknown error');
  }

  viewResult(batchId: any): void {
    this._toastService.info(`Please wait, Automatically redirect...`);
  
    const newTab = window.open('', '_blank');
    if (!newTab) {
      this._toastService.error('Failed to open new tab.');
      return;
    }
  
    const loadingHTML = `
      <html>
        <head>
          <title>Loading...</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%; width: 40px; height: 40px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body><div class="spinner"></div></body>
      </html>
    `;

    const errorHTML = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error occurred...</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; text-align: center; }
            .center { display: flex; flex-direction: column; align-items: center; gap: 10px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>Error occurred</h1>
            <span>Batch result file cannot be found!</span>
            <img src="https://i.giphy.com/l378giAZgxPw3eO52.webp" alt="Error Image">
          </div>
        </body>
      </html>
    `;
  
    newTab.document.write(loadingHTML);
    newTab.document.close();
  
    this.externalServices.viewBatchResult(batchId).subscribe((result) => {
      if (result.success) {
        newTab.location.href = result.fileUrl;
      } else {
        newTab.document.open();
        newTab.document.write(errorHTML);
        newTab.document.close();
      }
    });
  }
  
  onStatusChange(status: string): void {
    this.status = status;
    this.updateQueryParams(true);
    this.fetchOrSearchBatches(this.items, this.page, this.status, this.category, this.user.id || "");
  }

  onCategoryChange(category: string): void {
    this.category = category;
    this.updateQueryParams(true);
    this.fetchOrSearchBatches(this.items, this.page, this.status, this.category, this.user.id || "");
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applySearch();
    }
  }

  getPaginationInfo(): string {
    const startIndex = (this.page - 1) * this.items + 1;
    const endIndex = this.page * this.items > this.totalBatches ? this.totalBatches : this.page * this.items;
    return `Showing ${startIndex} - ${endIndex} of ${this.totalBatches}`;
  }
}