import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BatchesService } from "../../services/batches/batches.service";
import { WebSocketService } from "../../services/web-socket/web-socket.service";
import { UserDataService } from "../../services/user-data/user-data.service";
import { ToolsService } from "../../services/tools-list/tools.service";

interface TableRow {
  _id: string;
  selected: boolean;
  dateImported: string;
  dateUpdated: string;
  batchName: any;
  importBy: string;
  batchId: string;
  importNameTool: string;
  progress: number;
  status: string;
  statusClass: any;
  totalItems: number;
  hidden?: boolean;
}

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private batchesService: BatchesService,
    private websocketService: WebSocketService,
    private userDataService: UserDataService,
    private toolsService: ToolsService
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
    this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    this.websocketService.connectSocket();
    this.websocketService.sendMessage({
      reqType: 2,
      reqBody: {
        active: true,
      },
    });
    this.websocketService.receiveMessages().subscribe((message) => {
      if (message.updatedBatchId) {
        const batchToUpdate = this.tableData.find((batch) => batch._id === message.updatedBatchId);
        console.log(batchToUpdate);
        if (batchToUpdate) {
          batchToUpdate.progress = message.progress;
          console.log(message.progress);
          batchToUpdate.status = message.progress === 100 ? `Completed ${batchToUpdate.totalItems} items` : `on-progress`;

          if (message.progress === 100) {
            setTimeout(() => {
              this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
            }, 3000);
          }
        }
      } else if (message.new) {
        this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
      }
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
      selected: false,
      dateImported: new Date(batch.createdAt).toLocaleString(),
      dateUpdated: new Date(batch.updatedAt).toLocaleString(),
      importBy: batch.requestorname,
      batchId: batch.batchid,
      importNameTool: batch.tool,
      batchName: batch.batchname,
      progress: batch.progress,
      totalItems: batch.totalitems,
      status: batch.progress === 100 ?
        `Completed` :
        (batch.status === 2 ? 'Error' : 'in-progress'),

      statusClass: batch.progress === 100 ?
        "bg-green-200 text-green-800" :
        (batch.status === 2 ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"),

      hidden: false,
    }));
    this.totalBatches = response.totalBatches;
  }

  deleteBatch(batchId: string): void {

    if (confirm(`Are you sure you want to delete batch ${batchId}`)) {
      this.batchesService.deleteBatch(batchId).subscribe(
        (response) => {
          if (response.batchId == batchId) {
            alert(`Batch: ${batchId} Succesfully Deleted!`);
            this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
          }
        },
        (error) => {
          console.error("Error deleting batch", error);
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
      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchOrSearchBatches(this.items, this.page, this.filter, this.category, this.user.id || "");
    }
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

    onStatusChange(status: string): void {
      this.status = status;
      this.fetchOrSearchBatches(this.items, this.page, this.status, this.category, this.user.id || "");
    }
  
    onCategoryChange(category: string): void {
      this.category = category;
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