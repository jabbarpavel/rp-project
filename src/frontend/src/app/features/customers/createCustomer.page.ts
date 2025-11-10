import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { CustomerFormComponent } from './customerForm.component';
import { ToastService } from '../../core/services/toast.service'; // neu

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [CommonModule, CustomerFormComponent],
  template: `
    <div class="page-container">
      <h2>Neuen Kunden erstellen</h2>
      <app-customer-form
        [model]="customer"
        [loading]="loading"
        [error]="error"
        submitLabel="Kunden speichern"
        (submit)="createCustomer()"
        (cancel)="cancel()">
      </app-customer-form>
    </div>
  `,
  styleUrls: ['./customers.page.scss']
})
export class CreateCustomerPage {
  customer = { name: '', email: '' };
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService // neu
  ) {}

  createCustomer(): void {
    if (this.loading) return;
    if (!this.customer.name || !this.customer.email) return;

    this.loading = true;
    this.error = '';

    this.api.post('/api/customer', this.customer).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Kunde erfolgreich erstellt', 'success'); // neu
        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        this.error =
          typeof err?.error === 'string'
            ? err.error
            : 'Fehler beim Erstellen des Kunden.';
        this.toast.show('Fehler beim Erstellen des Kunden', 'error'); // neu
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }
}
