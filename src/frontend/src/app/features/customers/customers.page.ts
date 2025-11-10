import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

interface CustomerDto {
  id: number;
  firstName?: string;
  name: string;
  email: string;
  isDeleted?: boolean;
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
  filteredCustomers: CustomerDto[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  sortColumn: keyof CustomerDto | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private sub?: Subscription;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';

    this.sub = this.api.get<CustomerDto[]>('/api/customer').subscribe({
      next: (res: CustomerDto[]) => {
        this.customers = res.filter(c => !c.isDeleted);
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = this.extractError(err, 'Fehler beim Laden der Kunden.');
        this.toast.show('Kunden konnten nicht geladen werden', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredCustomers = term
      ? this.customers.filter(c =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
        )
      : [...this.customers];

    this.applySorting();
  }

  sortBy(column: keyof CustomerDto): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    if (!this.sortColumn) return;

    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredCustomers.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * dir;
      }

      return (valA > valB ? 1 : valA < valB ? -1 : 0) * dir;
    });
  }

  createCustomer(): void {
    this.router.navigate(['/customers/createCustomer']);
  }

  editCustomer(c: CustomerDto): void {
    this.router.navigate(['/customers/editCustomer', c.id]);
  }

  viewCustomer(c: CustomerDto): void {
    this.router.navigate(['/customers', c.id]);
  }

  async deleteCustomer(id: number): Promise<void> {
    const ok = await this.confirm.open(
      'Diesen Kunden wirklich löschen?',
      'Löschen',
      'Abbrechen'
    );
    if (!ok) return;

    this.api.delete(`/api/customer/${id}`).subscribe({
      next: () => {
        this.loadCustomers();
        this.toast.show('Kunde gelöscht', 'success');
      },
      error: (err: any) => {
        this.error = this.extractError(err, 'Fehler beim Löschen des Kunden.');
        this.toast.show('Fehler beim Löschen', 'error');
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
