import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgFor],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of toasts"
        class="toast"
        [ngClass]="t.type">
        {{ t.text }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      right: 1.5rem;
      bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 1000;
    }

    .toast {
      padding: 0.8rem 1.2rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      animation: fadeIn 0.25s ease;
    }

    .success { background-color: #10b981; }
    .error { background-color: #ef4444; }
    .info { background-color: #3b82f6; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
  toasts: ToastMessage[] = [];
  constructor(private toastService: ToastService) {
    this.toastService.toasts.subscribe(list => this.toasts = list);
  }
}
