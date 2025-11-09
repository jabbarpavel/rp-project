import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface CustomerDto {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss']
})
export class CustomersPage implements OnInit {
  customers: CustomerDto[] = [];
  loading = false;
  error = '';
  private sub?: Subscription;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';

    this.sub = this.api.get<CustomerDto[]>('/api/customer').subscribe({
      next: (res: CustomerDto[]) => {
        this.customers = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Fehler beim Laden:', err);
        this.error = this.extractError(err, 'Fehler beim Laden der Kunden.');
        this.loading = false;
      }
    });
  }

  createCustomer(): void {
    this.router.navigate(['/customers/createCustomer']);
  }

  editCustomer(c: CustomerDto): void {
    this.router.navigate(['/customers/editCustomer', c.id]);
  }

  /** NEU: Kunde anklicken → Detailseite */
  viewCustomer(c: CustomerDto): void {
    this.router.navigate(['/customers', c.id]);
  }

  deleteCustomer(id: number): void {
    if (!confirm('Diesen Kunden wirklich löschen?')) return;

    this.api.delete(`/api/customer/${id}`).subscribe({
      next: () => this.loadCustomers(),
      error: (err: any) => {
        console.error('Fehler beim Löschen:', err);
        this.error = this.extractError(err, 'Fehler beim Löschen des Kunden.');
      }
    });
  }

  private extractError(err: any, fallback: string): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.message) return err.error.message;
    return fallback;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
