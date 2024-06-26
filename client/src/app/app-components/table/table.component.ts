import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BatchesService } from "../../services/batches/batches.service";
import { WebSocketService } from "../../services/web-socket/web-socket.service";

interface TableRow {
  _id: string;
  selected: boolean;
  dateImported: string;
  dateUpdated: string;
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
  items: number = 20;
  page: number = 1;
  totalBatches: number = 0;
  filter: string = "";
  category: string = "";

  constructor(private batchesService: BatchesService, private websocketService: WebSocketService) {}

  public batchMonitoringData = {
    reqType: 2,
    reqBody: {
      active: true
    }
  };

  ngOnInit(): void {
    this.fetchBatches();
    this.websocketService.connectSocket();
    this.websocketService.sendMessage({
      reqType: 2,
      reqBody: {
        active: true,
      },
    });
    this.websocketService.receiveMessages().subscribe((message) => {
      if (message.updatedBatchId) {

        const batchToUpdate = this.tableData.find(
          (batch) => batch._id === message.updatedBatchId._id
        );
        if (batchToUpdate) {
          batchToUpdate.progress = message.progress;
          batchToUpdate.status =
            message.progress === 100
              ? `Completed ${batchToUpdate.totalItems} items`
              : `on-progress`;
        }
      }
    });
  }

  fetchBatches(): void {
    this.batchesService
      .getBatches(this.items, this.page, this.filter, this.category)
      .subscribe((response) => {
        this.tableData = response.batch.map((batch: any) => ({
          _id: batch._id,
          selected: false,
          dateImported: new Date(batch.createdAt).toLocaleString(),
          dateUpdated: new Date(batch.updatedAt).toLocaleString(),
          importBy: batch.requestorname,
          batchId: batch.batchid,
          importNameTool: batch.tool,
          progress: batch.progress,
          totalItems: batch.totalitems,
          status:
            batch.progress === 100
              ? `Completed ${batch.totalitems} items`
              : `on-progress`,
          statusClass: batch.progress === 100 ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800',
          hidden: false,
        }));
        this.totalBatches = response.totalBatches;
      });
  }

  getProgressBarColor(progress: number): string {
    if (progress <= 10) return "#FFEB3B"; // Light Yellow
    if (progress <= 20) return "#FFDD33";
    if (progress <= 30) return "#FFCC33";
    if (progress <= 40) return "#FFBB33";
    if (progress <= 50) return "#FFAA33"; // Dark Yellow
    if (progress <= 60) return "#FFA533";
    if (progress <= 70) return "#FF9933";
    if (progress <= 80) return "#FF8A33";
    if (progress <= 90) return "#FF7A33";
    if (progress <= 100) return "#4CAF50"; // Green
    return "#FFEB3B"; // Default color (light yellow)
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
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();

    if (!lowerCaseSearchTerm) {
      this.tableData.forEach((row) => (row.hidden = false));
      return;
    }

    this.tableData.forEach((row) => {
      const matchesSearch =
        row.dateImported.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.dateUpdated.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.importBy.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.batchId.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.importNameTool.toLowerCase().includes(lowerCaseSearchTerm) ||
        row.status.toLowerCase().includes(lowerCaseSearchTerm);

      row.hidden = !matchesSearch;
    });
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.page = page;
      this.fetchBatches();
    }
  }

  nextPage(): void {
    alert(this.page);
    if (this.page * this.items < this.totalBatches) {
      this.page++;
      this.fetchBatches();
    }
  }

  previousPage(): void {
    alert(this.page);
    if (this.page > 1) {
      this.page--;
      this.fetchBatches();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalBatches / this.items);
  }
}
