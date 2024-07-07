import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { UserDataService } from "../../services/user-data/user-data.service";
import { UsersService } from "../../services/users/users.service";

interface TableRow {
  _id: string;
  internalId: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  department: string;
  role: any;
  addedBy: string;
  status: Boolean;
  updatedDate: string;
}


@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css'
})
export class UsersTableComponent implements OnInit {
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
 
    private userDataService: UserDataService,
    private usersService: UsersService
  ) { }

  public user = this.userDataService.getUserDataFromCookies();

  ngOnInit(): void {
    this.usersService.getAllUSers(this.items, this.page, this.filter, this.category, "").subscribe((response) => {
      this.updateTableData(response);
    });
  }

  updateTableData(response: any): void {
    this.tableData = response.usersList.map((user: any) => ({
      _id: user._id,
      internalId: user.internalid,
      firstName: user.firstname,
      lastName: user.lastName,
      middleName: user.middlename,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      department: user.department,
      role: user.role,
      addedBy: user.createby,
      status: user.isactive === true ? 'Active' : 'Inactive',
      updatedDate: new Date(user.updatedAt).toLocaleString(),
    }));
    // this.totalBatches = response.totalBatches;
  }


}
