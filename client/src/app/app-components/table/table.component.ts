import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BatchesService } from "../../services/batches/batches.service";

interface TableRow {
  selected: boolean;
  dateImported: string;
  dateUpdated: string;
  importBy: string;
  batchId: string;
  importNameTool: string;
  progress: Number;
  status: string;
  totalItems: Number;
  hidden?: boolean;
}

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent {
  tableData: TableRow[] = [];
  sortColumn: string | null = null;
  sortDirection: "asc" | "desc" = "asc";
  searchTerm: string = "";
  items: number = 20;
  page: number = 1;
  totalBatches: number = 0;
  filter: string = "";
  category: string = "";

  constructor(private batchesService: BatchesService) {}

  ngOnInit(): void {
    this.fetchBatches();
  }

  fetchBatches(): void {
    this.batchesService
      .getBatches(this.items, this.page, this.filter, this.category)
      .subscribe((response) => {
        this.tableData = response.batch.map((batch: any) => ({
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
          hidden: false,
        }));
        this.totalBatches = response.totalBatches;
      });
  }

  downloadResult(batchId: any): void {
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
