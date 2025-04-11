import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = 'Default Title';
  @Input() width: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'lg';
  @Output() onClose = new EventEmitter<void>();

  get dynamicWidthClass(): string {
    return {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      'full': 'max-[90%]'
    }[this.width];
  }

  closeModal() {
    this.onClose.emit();
  }
}
