import { Component } from '@angular/core';
import { UsersTableComponent } from '../../app-components/users-table/users-table.component';
@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [UsersTableComponent],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent {

}
