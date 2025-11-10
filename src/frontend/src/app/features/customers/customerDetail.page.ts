import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="header-bar">
        <h2>Kundendetails</h2>
        <div class="actions">
          <button class="edit-btn" type="button" (click)="editCustomer()">Bearbeiten</button>
          <button class="delete-btn" type="button" (click)="deleteCustomer()">Löschen</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Lade Kundendaten...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error && customer" class="detail-card">
        <div class="detail-row"><span>ID:</span> {{ customer.id }}</div>
        <div class="detail-row"><span>Name:</span> {{ customer.name }}</div>
        <div class="detail-row"><span>E-Mail:</span> {{ customer.email }}</div>
        <div class="detail-row"><span>Erstellt am:</span> {{ customer.createdAt | date: 'short' }}</div>
        <div class="detail-row"><span>Zuletzt geändert:</span> {{ customer.updatedAt | date: 'short' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      background: #f9fafb;
      min-height: 100vh;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-bar h2 {
      font-size: 1.6rem;
      font-weight: 600;
      color: #1f2937;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .edit-btn {
      background-color: #fde68a; /* wie liste */
      color: #92400e;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .edit-btn:hover {
      background-color: #fbbf24;
    }

    .delete-btn {
      background-color: #fca5a5; /* wie liste */
      color: #7f1d1d;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .delete-btn:hover {
      background-color: #f87171;
    }

    .detail-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 1.5rem;
      max-width: 480px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.95rem;
    }

    .detail-row span {
      font-weight: 600;
      color: #374151;
    }

    .loading,
    .error {
      text-align: center;
      margin-top: 2rem;
    }

    .error {
      color: #dc2626;
      font-weight: 500;
    }
  `]
})
export class CustomerDetailPage implements OnInit {
  id!: number;
  customer: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) this.loadCustomer();
  }

  loadCustomer(): void {
    this.loading = true;
    this.api.get(`/api/customer/${this.id}`).subscribe({
      next: (res) => {
        this.customer = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Kunde konnte nicht geladen werden.';
        this.toast.show('Fehler beim Laden des Kunden', 'error');
        this.loading = false;
      }
    });
  }

  editCustomer(): void {
    this.router.navigate(['/customers/editCustomer', this.id]);
  }

  async deleteCustomer(): Promise<void> {
    const ok = await this.confirm.open(
      'Diesen Kunden wirklich löschen?',
      'Löschen',
      'Abbrechen'
    );
    if (!ok) return;

    this.api.delete(`/api/customer/${this.id}`).subscribe({
      next: () => {
        this.toast.show('Kunde gelöscht', 'success');
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.error = 'Kunde konnte nicht gelöscht werden.';
        this.toast.show('Fehler beim Löschen des Kunden', 'error');
      }
    });
  }
}
