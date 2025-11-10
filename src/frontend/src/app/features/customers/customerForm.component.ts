import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <form (submit)="onSubmit($event)" class="customer-form">
        <div class="form-group">
          <label for="firstName">Vorname</label>
          <input
            id="firstName"
            type="text"
            [(ngModel)]="model.firstName"
            name="firstName"
            placeholder="Vorname eingeben"
          />
        </div>
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            [(ngModel)]="model.name"
            name="name"
            placeholder="Kundenname eingeben"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input
            id="email"
            type="email"
            [(ngModel)]="model.email"
            name="email"
            placeholder="E-Mail-Adresse eingeben"
            required
          />
        </div>

        <div class="button-group">
          <button type="submit" [disabled]="loading">
            {{ submitLabel }}
          </button>
          <button type="button" class="cancel" (click)="cancel.emit()">Abbrechen</button>
        </div>

        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: #ffffff;
      padding: 2rem;
      border-radius: 12px;
      max-width: 480px;
      margin: 2rem auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    label {
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: #1f2937;
    }
    input {
      padding: 0.7rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s ease;
    }
    input:focus {
      border-color: #3b82f6;
      outline: none;
    }
    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 0.8rem;
    }
    button {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    button[type="submit"] {
      background-color: #3b82f6;
      color: white;
    }
    button.cancel {
      background-color: #e5e7eb;
      color: #111827;
    }
    button:hover:not(:disabled) {
      opacity: 0.9;
    }
    .error {
      color: #dc2626;
      text-align: center;
      margin-top: 1rem;
      font-size: 0.9rem;
    }
  `]
})
export class CustomerFormComponent {
  @Input() model = { firstName: '', name: '', email: '' };
  @Input() loading = false;
  @Input() error = '';
  @Input() submitLabel = 'Speichern';
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.loading) return;
    this.submit.emit();
  }
}
