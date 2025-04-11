import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { UserDataService } from "../../services/user-data/user-data.service";
import { UsersService } from "../../services/users/users.service";
import { FormsModule } from "@angular/forms";
import { AddUserModalComponent } from "../add-user-modal/add-user-modal.component";
import { DeleteService } from "../../services/delete/delete.service";
import { EditUserModalComponent } from "../edit-user-modal/edit-user-modal.component";


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
  status: string; 
  updatedDate: string;
  accessLevel: any;
  profile: any;
}

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AddUserModalComponent, EditUserModalComponent],
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
  totalUsers: number = 0;
  filter: string = "";
  status: string = "";
  category: string = "";
  toggleChecked: boolean = localStorage.getItem('showallbatches') === 'true';
  tools: any = {};
  isModalVisible: boolean = false;
  isEditModalVisible: boolean = false;
  selectedUser: any;
  readonly profileBaseUrl ="https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";
  
  constructor(
    private deleteService: DeleteService,
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
      lastName: user.lastname,
      middleName: user.middlename,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      department: user.department,
      role: user.role,
      addedBy: user.createby,
      status: user.isactive === true ? 'Active' : 'Inactive',
      updatedDate: new Date(user.updatedAt).toLocaleString(),
      accessLevel: user.accesslevel,
      profile: `${this.profileBaseUrl}${user.image}`
    }));
    this.totalUsers = response.totalUsers;
  }

  nextPage(): void {
    if (this.page * this.items < this.totalUsers) {
      this.page++;
      this.usersService.getAllUSers(this.items, this.page, this.status, this.category, "").subscribe((response) => {
        this.updateTableData(response);
      });
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.usersService.getAllUSers(this.items, this.page, this.status, this.category, "").subscribe((response) => {
        this.updateTableData(response);
      });
    }
  }

  onStatusChange(status: string): void {
    this.status = status;
    this.usersService.getAllUSers(this.items, this.page, this.status, this.category, "").subscribe((response) => {
      this.updateTableData(response);
    });
  }

  onCategoryChange(category: string): void {
    this.category = category;
    this.usersService.getAllUSers(this.items, this.page, this.status, this.category, "").subscribe((response) => {
      this.updateTableData(response);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.items);
  }

  getPaginationInfo(): string {
    const startIndex = (this.page - 1) * this.items + 1;
    const endIndex = this.page * this.items > this.totalUsers ? this.totalUsers : this.page * this.items;
    return `Showing ${startIndex} - ${endIndex} of ${this.totalUsers}`;
  }

  openAddUser(): void {
    this.isModalVisible = true;
  }

  openEditUser(user: any): void {
    this.selectedUser = user;
    this.isEditModalVisible = true;
  }

  closeAddUser(): void {
    this.isModalVisible = false;
  }

  closeEditUser(): void {
    this.isEditModalVisible = false;
  }

  deleteUser(userId: string): void {
    if (confirm(`Are you sure you want to delete User ${userId} this action cannot be undone`)) {
      this.deleteService.deleteUser(userId).subscribe((response) => {
        if (response.message) {
          this.usersService.getAllUSers(this.items, this.page, this.filter, this.category, "").subscribe((response) => {
            this.updateTableData(response);
          });
        } else {
          alert('error occurred!');
        }
      });
    }
  }
}
