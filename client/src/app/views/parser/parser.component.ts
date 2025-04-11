import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools-list/tools.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../app-components/modal/modal.component';
import { RequestToolFormComponent } from '../../app-components/misc-forms/request-tool-form/request-tool-form.component';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { FormsModule } from '@angular/forms';

interface Parser {
  name: string;
  subname: string;
  description: string;
  active: boolean;
  department: string;
}

@Component({
  selector: 'app-parser',
  standalone: true,
  imports: [RouterModule, CommonModule, ModalComponent, RequestToolFormComponent, AngularToastifyModule,FormsModule],
  templateUrl: './parser.component.html',
  styleUrl: './parser.component.css'
})
export class ParserComponent {
  isModalOpen = false;
  searchTerm: string = "";
  modalTitle = 'Request, Feedback & Suggestions Form';
  parsers: any = [];
  constructor(private toolsService: ToolsService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.toolsService.getParsers().subscribe(data => {
      this.parsers = data.parsers.filter((parser: Parser) => parser.active);
    });
  }
  closeModal() {
    this.isModalOpen = false;
  }
  applySearch(): void {
    
  }
}
