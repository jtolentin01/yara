import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TableRow {
  selected: boolean;
  dateImported: string;
  dateUpdated: string;
  importBy: string;
  batchId: string;
  importNameTool: string;
  status: string;
  hidden?: boolean; 
}


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  tableData: TableRow[] = [
    {
      selected: false,
      dateImported: '6/17/2024 21:09:10',
      dateUpdated: '6/17/2024 21:09:39',
      importBy: 'Jade Nguyin',
      batchId: 'LT-1718629751018',
      importNameTool: 'listing-loader v2',
      status: 'Completed - 136 EAN/s',
      hidden: false
    },
    {
      selected: false,
      dateImported: '6/17/2024 21:09:11',
      dateUpdated: '6/17/2024 21:09:39',
      importBy: 'Kimberly Langres',
      batchId: 'LT-1718629751019',
      importNameTool: 'listing-loader v2',
      status: 'Completed - 136 EAN/s',
      hidden: false
    },
    {
      selected: false,
      dateImported: '6/17/2024 21:09:12',
      dateUpdated: '6/17/2024 21:09:39',
      importBy: 'Merry Grace Poli',
      batchId: 'LT-1718629751020',
      importNameTool: 'listing-loader v2',
      status: 'Completed - 136 EAN/s',
      hidden: false
    },
  ];

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  toggleAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    this.tableData.forEach(row => {
      row.selected = isChecked;
    });
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.tableData.sort((a, b) => {
      let valueA = a[column as keyof TableRow];
      let valueB = b[column as keyof TableRow];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (this.sortDirection === 'asc') {
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
      this.tableData.forEach(row => row.hidden = false);
      return;
    }
  
    this.tableData.forEach(row => {
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
  
}
