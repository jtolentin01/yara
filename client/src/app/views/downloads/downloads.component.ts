import { Component } from '@angular/core';
import { TableComponent } from '../../app-components/table/table.component';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.css'
})
export class DownloadsComponent {

}
