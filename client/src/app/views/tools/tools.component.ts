import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools-list/tools.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../app-components/modal/modal.component';
import { RequestToolFormComponent } from '../../app-components/misc-forms/request-tool-form/request-tool-form.component';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { FormsModule } from '@angular/forms';


interface Tool {
  name: string;
  subname: string;
  description: string;
  active: boolean;
  department: string;
}

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [RouterModule, CommonModule, ModalComponent, RequestToolFormComponent, AngularToastifyModule,FormsModule],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css'
})
export class ToolsComponent implements OnInit {
  isModalOpen = false;
  searchTerm: string = "";
  modalTitle = 'Request, Feedback & Suggestions Form';
  tools: any = [];
  constructor(private toolsService: ToolsService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.toolsService.getTools().subscribe(data => {
      this.tools = data.tools.filter((tool: Tool) => tool.active);
    });
  }
  applySearch(): void {
    
  }
  requestTool(): void {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }
  submitted() {
    this.isModalOpen = false;
    this.toastService.success('Submitted, Thank you!');
  }
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isModalOpen) {
      this.closeModal();
    }
  }

}
