import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CustomerFormComponent } from './customerForm.component';
import { ToastService } from '../../core/services/toast.service'; // neu

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
        (submit)="updateCustomer()"
        (cancel)="cancel()">
      </app-customer-form>
    </div>
  `,
  styleUrls: ['./customers.page.scss']
})
export class EditCustomerPage implements OnInit {
  customer = { id: 0,firstName: '', name: '', email: '', ahvNum: '' };
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private toast: ToastService // neu
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomer(id);
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.api.get(`/api/customer/${id}`).subscribe({
      next: (res: any) => {
        this.customer = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Fehler beim Laden des Kunden.';
        this.toast.show('Fehler beim Laden des Kunden', 'error'); // neu
        this.loading = false;
      }
    });
  }

  updateCustomer(): void {
    if (this.loading) return;
    this.loading = true;
    this.api.put(`/api/customer/${this.customer.id}`, this.customer).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Kunde erfolgreich aktualisiert', 'success'); // neu
        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        this.error = 'Fehler beim Aktualisieren.';
        this.toast.show('Fehler beim Aktualisieren', 'error'); // neu
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }
}
