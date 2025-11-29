import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService } from '../../core/services/permission.service';

interface CustomerDto {
  id: number;
  customerType?: number; // 0 = Privatperson, 1 = Organisation
  firstName?: string;
  name: string;
  email: string;
  ahvNum: string;
  companyName?: string;

  advisorId?: number | null;
  advisorEmail?: string | null;
  advisorFirstName?: string | null;
  advisorLastName?: string | null;

  civilStatus?: string | null;
  religion?: string | null;
  gender?: string | null;
  salutation?: string | null;
  birthDate?: string | null;
  profession?: string | null;
  language?: string | null;

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
  typeFilter: 'all' | 'private' | 'org' = 'all';
  loading = false;
  error = '';
  sortColumn: keyof CustomerDto | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  canDelete = false;
  private sub?: Subscription;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canDelete = this.permissionService.canDeleteCustomers();
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

  setTypeFilter(filter: 'all' | 'private' | 'org'): void {
    this.typeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    let filtered = [...this.customers];

    // Apply type filter
    if (this.typeFilter === 'private') {
      filtered = filtered.filter(c => c.customerType === 0 || c.customerType === undefined);
    } else if (this.typeFilter === 'org') {
      filtered = filtered.filter(c => c.customerType === 1);
    }

    // Apply search filter
    if (term) {
      filtered = filtered.filter(c => {
        const firstName = c.firstName?.toLowerCase() ?? '';
        const lastName = c.name?.toLowerCase() ?? '';
        const email = c.email?.toLowerCase() ?? '';
        const ahv = c.ahvNum?.toLowerCase() ?? '';
        const companyName = c.companyName?.toLowerCase() ?? '';

        const advFirst = c.advisorFirstName?.toLowerCase() ?? '';
        const advLast = c.advisorLastName?.toLowerCase() ?? '';
        const advEmail = c.advisorEmail?.toLowerCase() ?? '';

        return (
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term) ||
          ahv.includes(term) ||
          companyName.includes(term) ||
          advFirst.includes(term) ||
          advLast.includes(term) ||
          advEmail.includes(term)
        );
      });
    }

    this.filteredCustomers = filtered;
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

  getAdvisorDisplay(c: CustomerDto): string {
    const fn = c.advisorFirstName?.trim() || '';
    const ln = c.advisorLastName?.trim() || '';
    const email = c.advisorEmail?.trim() || '';

    if (fn && ln) return `${fn} ${ln}`;
    if (email) return email;
    return '–';
  }
}
