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
  customer: any = {
    customerType: 0, // 0 = Privatperson, 1 = Organisation
    firstName: '',
    name: '',
    email: '',
    ahvNum: '',
    advisorId: null as number | null,

    // Privatperson fields
    civilStatus: null as string | null,
    religion: null as string | null,
    gender: null as string | null,
    salutation: null as string | null,
    birthDate: null as string | null,
    profession: '',
    language: null as string | null,
    
    // Address fields
    street: '',
    postalCode: '',
    locality: '',
    canton: null as string | null,
    
    isPrimaryContact: true, // Default true for new customers

    // Organisation fields
    companyName: '',
    legalForm: null as string | null,
    industry: '',
    uidNumber: '',
    foundingDate: null as string | null,
    homepage: '',
    activityType: '',
    nogaCode: '',
    revenue: null as number | null,
    vtbg: null as number | null,
    employeeCount: null as string | null,
    totalSalary: null as number | null,

    // Organisation contact fields
    contactSalutation: null as string | null,
    contactFirstName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  };

  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  createCustomer(): void {
    if (this.loading) return;
    if (!this.customer.name || !this.customer.email) return;

    this.loading = true;
    this.error = '';

    this.api.post<any>('/api/customer', this.customer).subscribe({
      next: (response) => {
        this.loading = false;
        this.toast.show('Kunde erfolgreich erstellt', 'success');
        // Navigate to customer detail page to add relationships
        if (response && response.id) {
          this.router.navigate(['/customers', response.id]);
        } else {
          this.router.navigate(['/customers']);
        }
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
