import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../tools.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css'
})
export class ToolsComponent implements OnInit{
  tools: any = {};
  constructor(private toolsService: ToolsService) {}

  ngOnInit(): void {
    this.toolsService.getTools().subscribe(data => {
      this.tools = data;
      console.log(`Data Result for Tools Component: ${JSON.stringify(data)}`);
    });
  }
}
