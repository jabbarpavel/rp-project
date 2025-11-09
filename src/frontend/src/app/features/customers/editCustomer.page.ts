import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CustomerFormComponent } from './customerForm.component';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [CommonModule, CustomerFormComponent],
  template: `
    <div class="page-container">
      <h2>Kunden bearbeiten</h2>

      <app-customer-form
        [model]="customer"
        [loading]="loading"
        [error]="error"
        submitLabel="Änderungen speichern"
        (submit)="saveCustomer()"
        (cancel)="cancel()">
      </app-customer-form>
    </div>
  `,
  styleUrls: ['./customers.page.scss']
})
export class EditCustomerPage implements OnInit {
  id!: number;
  customer = { name: '', email: '' };
  error = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) this.loadCustomer();
  }

  loadCustomer(): void {
    this.loading = true;
    this.api.get<any>(`/api/customer/${this.id}`).subscribe({
      next: (res) => {
        this.customer.name = res.name;
        this.customer.email = res.email;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden des Kunden:', err);
        this.error = 'Kunde konnte nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  saveCustomer(): void {
    if (!this.customer.name || !this.customer.email) return;
    this.loading = true;

    this.api.put(`/api/customer/${this.id}`, this.customer).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        this.error = 'Änderungen konnten nicht gespeichert werden.';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }
}
