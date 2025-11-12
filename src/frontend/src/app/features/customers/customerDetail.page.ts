import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AdvisorChangeDialogComponent } from '../../shared/components/advisor-change-dialog.component';

interface CustomerDetailDto {
  id: number;
  firstName: string;
  name: string;
  email: string;
  ahvNum: string;
  advisorId: number | null;
  advisorEmail: string | null;
  tenantId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvisorChangeDialogComponent],
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

      <div *ngIf="!loading && !error && customer" class="detail-wrap">
        <div class="detail-card">
          <div class="detail-row"><span>ID:</span> {{ customer.id }}</div>
          <div class="detail-row"><span>Vorname:</span> {{ customer.firstName }}</div>
          <div class="detail-row"><span>Name:</span> {{ customer.name }}</div>
          <div class="detail-row"><span>E-Mail:</span> {{ customer.email }}</div>
          <div class="detail-row"><span>AHV-Nummer:</span> {{ customer.ahvNum }}</div>
          <div class="detail-row"><span>Erstellt am:</span> {{ customer.createdAt | date: 'short' }}</div>
          <div class="detail-row"><span>Zuletzt geändert:</span> {{ customer.updatedAt | date: 'short' }}</div>
        </div>

        <div class="advisor-card">
          <div class="advisor-header">
            <h3>Berater</h3>
            <div class="advisor-actions">
              <button class="link-btn" type="button" (click)="openAdvisorDialog()">Wechseln</button>
              <button class="link-btn danger" type="button" (click)="removeAdvisor()" *ngIf="customer.advisorId">Entfernen</button>
            </div>
          </div>

          <div class="advisor-body" *ngIf="customer.advisorId; else noAdvisor">
            <div class="advisor-row"><span>E-Mail:</span> {{ customer.advisorEmail }}</div>
          </div>
          <ng-template #noAdvisor>
            <div class="advisor-empty">Kein Berater zugewiesen.</div>
          </ng-template>
        </div>
      </div>

      <!-- Overlay-Dialog für Beraterwechsel -->
      <app-advisor-change-dialog
        *ngIf="showAdvisorDialog"
        [advisorEmail]="advisorEmailInput"
        (confirmed)="confirmAdvisorChange($event)"
        (closed)="closeAdvisorDialog()">
      </app-advisor-change-dialog>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; background: #f9fafb; min-height: 100vh; }
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-bar h2 { font-size: 1.6rem; font-weight: 600; color: #1f2937; }
    .actions { display: flex; gap: 0.5rem; }
    .edit-btn { background-color: #fde68a; color: #92400e; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .edit-btn:hover { background-color: #fbbf24; }
    .delete-btn { background-color: #fca5a5; color: #7f1d1d; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .delete-btn:hover { background-color: #f87171; }
    .loading, .error { text-align: center; margin-top: 2rem; }
    .error { color: #dc2626; font-weight: 500; }

    .detail-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
    @media (max-width: 900px) { .detail-wrap { grid-template-columns: 1fr; } }

    .detail-card, .advisor-card {
      background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 1.5rem;
    }

    .detail-card { max-width: 520px; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.95rem; }
    .detail-row span { font-weight: 600; color: #374151; }

    .advisor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem; }
    .advisor-header h3 { margin: 0; font-size: 1.1rem; color: #111827; }
    .advisor-actions { display: flex; gap: .6rem; }
    .link-btn { background: transparent; border: none; color: #2563eb; font-weight: 600; cursor: pointer; }
    .link-btn:hover { text-decoration: underline; }
    .link-btn.danger { color: #b91c1c; }

    .advisor-row { display: flex; justify-content: space-between; padding: .45rem 0; border-bottom: 1px dashed #e5e7eb; }
    .advisor-empty { color: #6b7280; font-style: italic; padding: .2rem 0; }
  `]
})
export class CustomerDetailPage implements OnInit {
  id!: number;
  customer: CustomerDetailDto | null = null;
  loading = false;
  error = '';

  showAdvisorDialog = false;
  advisorEmailInput = '';

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
    this.api.get<CustomerDetailDto>(`/api/customer/${this.id}`).subscribe({
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
    const ok = await this.confirm.open('Diesen Kunden wirklich löschen?', 'Löschen', 'Abbrechen');
    if (!ok) return;

    this.api.delete(`/api/customer/${this.id}`).subscribe({
      next: () => {
        this.toast.show('Kunde gelöscht', 'success');
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.toast.show('Fehler beim Löschen des Kunden', 'error');
      }
    });
  }

  openAdvisorDialog(): void {
    this.showAdvisorDialog = true;
    this.advisorEmailInput = '';
  }

  closeAdvisorDialog(): void {
    this.showAdvisorDialog = false;
  }

  confirmAdvisorChange(advisorId: number): void {
    if (!this.customer) return;

    this.api.put(`/api/customer/${this.customer.id}/advisor`, { advisorId }).subscribe({
      next: () => {
        this.toast.show('Berater erfolgreich geändert', 'success');
        this.closeAdvisorDialog();
        this.loadCustomer();
      },
      error: () => {
        this.toast.show('Fehler beim Ändern des Beraters', 'error');
      }
    });
  }

  async removeAdvisor(): Promise<void> {
    const ok = await this.confirm.open('Möchten Sie den Berater wirklich entfernen?', 'Entfernen', 'Abbrechen');
    if (!ok) return;

    this.api.put(`/api/customer/${this.id}/advisor`, { advisorId: null }).subscribe({
      next: () => {
        this.toast.show('Berater entfernt', 'success');
        this.loadCustomer();
      },
      error: () => {
        this.toast.show('Fehler beim Entfernen des Beraters', 'error');
      }
    });
  }
}
