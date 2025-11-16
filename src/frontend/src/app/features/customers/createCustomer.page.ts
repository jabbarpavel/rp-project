// C:\Users\jabba\Desktop\rp-project\src\frontend\src\app\features\customers\createCustomer.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import { CustomerFormComponent } from './customerForm.component';
import { ToastService } from '../../core/services/toast.service';

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
export class CreateCustomerPage implements OnInit {
  customer = { firstName: '', name: '', email: '', ahvNum: '', advisorId: null as number | null };
  advisors: Array<{ id: number; email: string }> = [];
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAdvisors();
  }

  loadAdvisors(): void {
    this.api.get<Array<{ id: number; email: string }>>('/api/user/advisors').subscribe({
      next: (res) => this.advisors = res,
      error: () => this.toast.show('Fehler beim Laden der Berater', 'error')
    });
  }

  createCustomer(): void {
    if (this.loading) return;
    if (!this.customer.name || !this.customer.email) return;

    this.loading = true;
    this.error = '';

    this.api.post('/api/customer', this.customer).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Kunde erfolgreich erstellt', 'success');
        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        this.error =
          typeof err?.error === 'string'
            ? err.error
            : 'Fehler beim Erstellen des Kunden.';
        this.toast.show('Fehler beim Erstellen des Kunden', 'error');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }
}
