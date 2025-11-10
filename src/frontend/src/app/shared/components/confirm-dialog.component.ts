import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="data" class="overlay">
      <div class="dialog">
        <p>{{ data.message }}</p>
        <div class="buttons">
          <button class="confirm" (click)="confirm(true)">{{ data.confirmText }}</button>
          <button class="cancel" (click)="confirm(false)">{{ data.cancelText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: #fff;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: 360px;
      text-align: center;
      font-size: 0.95rem;
    }

    .buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .confirm {
      background-color: #ef4444;
      color: #fff;
    }

    .confirm:hover {
      background-color: #dc2626;
    }

    .cancel {
      background-color: #e5e7eb;
      color: #111827;
    }

    .cancel:hover {
      background-color: #d1d5db;
    }
  `]
})
export class ConfirmDialogComponent {
  data: any = null;

  constructor(private confirmService: ConfirmDialogService) {
    this.confirmService.dialog.subscribe(d => this.data = d);
  }

  confirm(result: boolean) {
    this.confirmService.close(result);
  }
}
