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
  advisorFirstName: string | null;
  advisorLastName: string | null;
  advisorPhone: string | null;
  advisorIsActive: boolean | null;
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

        <!-- LINKER BLOCK -->
        <div class="detail-card">
          <div class="detail-row"><span>ID:</span> {{ customer.id }}</div>
          <div class="detail-row"><span>Vorname:</span> {{ customer.firstName }}</div>
          <div class="detail-row"><span>Name:</span> {{ customer.name }}</div>
          <div class="detail-row"><span>E-Mail:</span> {{ customer.email }}</div>
          <div class="detail-row"><span>AHV-Nummer:</span> {{ customer.ahvNum }}</div>
          <div class="detail-row"><span>Erstellt am:</span> {{ customer.createdAt | date: 'short' }}</div>
          <div class="detail-row"><span>Zuletzt geändert:</span> {{ customer.updatedAt | date: 'short' }}</div>
        </div>

        <!-- RECHTER BLOCK: BERATER -->
        <div class="advisor-card">

          <div class="advisor-header">
            <div>
              <h3>Berater</h3>

              <!-- Inaktiv-Label direkt unter dem Titel -->
              <div class="inactive-badge" *ngIf="customer.advisorIsActive === false">
                ! Berater inaktiv
              </div>
            </div>

            <div class="advisor-actions">
              <button class="link-btn" type="button" (click)="openAdvisorDialog()">Wechseln</button>
              <button class="link-btn danger" type="button" (click)="removeAdvisor()" *ngIf="customer.advisorId">
                Entfernen
              </button>
            </div>
          </div>

          <div *ngIf="customer.advisorId; else noAdvisor" class="advisor-body">

            <div class="advisor-row" *ngIf="getAdvisorName(customer)">
              <span>Name:</span> {{ getAdvisorName(customer) }}
            </div>

            <div class="advisor-row">
              <span>E-Mail:</span> {{ customer.advisorEmail }}
            </div>

            <div class="advisor-row" *ngIf="customer.advisorPhone">
              <span>Telefon:</span> {{ customer.advisorPhone }}
            </div>

          </div>

          <ng-template #noAdvisor>
            <div class="advisor-empty">Kein Berater zugewiesen.</div>
          </ng-template>
        </div>
      </div>

      <app-advisor-change-dialog
        *ngIf="showAdvisorDialog"
        (confirmed)="confirmAdvisorChange($event)"
        (closed)="closeAdvisorDialog()">
      </app-advisor-change-dialog>
    </div>
  `,

  styles: [`
    .page-container { padding: 2rem; background: #f9fafb; min-height: 100vh; }

    .header-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }

    .actions { display:flex; gap:.5rem; }

    .edit-btn { background:#fde68a; color:#92400e; border:none; padding:.5rem 1rem; border-radius:8px; font-weight:600; cursor:pointer; }
    .delete-btn { background:#fca5a5; color:#7f1d1d; border:none; padding:.5rem 1rem; border-radius:8px; font-weight:600; cursor:pointer; }

    .detail-wrap { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    @media(max-width:900px){ .detail-wrap{ grid-template-columns:1fr; } }

    .detail-card, .advisor-card {
      background:#fff; border-radius:12px;
      box-shadow:0 2px 8px rgba(0,0,0,0.04);
      padding:1.2rem;
    }

    .detail-row, .advisor-row {
      display:flex; justify-content:space-between;
      padding:.45rem 0;
      border-bottom:1px solid #f3f4f6;
      font-size:.95rem;
    }
    .detail-row span, .advisor-row span { font-weight:600; color:#374151; }

    .advisor-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.5rem; }

    .inactive-badge {
      background:#fee2e2;
      color:#b91c1c;
      font-weight:700;
      padding:.15rem .45rem;
      border-radius:999px;
      font-size:.8rem;
      margin-top:.25rem;
      display:inline-block;
    }

    .link-btn { background:none; border:none; color:#2563eb; cursor:pointer; font-weight:600; }
    .link-btn.danger { color:#b91c1c; }

    .advisor-empty { color:#6b7280; font-style:italic; padding-top:.5rem; }
  `]
})
export class CustomerDetailPage implements OnInit {
  id!: number;
  customer: CustomerDetailDto | null = null;
  loading = false;
  error = '';
  showAdvisorDialog = false;

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
      next: res => { this.customer = res; this.loading = false; },
      error: () => {
        this.error = 'Kunde konnte nicht geladen werden.';
        this.toast.show('Fehler beim Laden des Kunden', 'error');
        this.loading = false;
      }
    });
  }

  getAdvisorName(c: CustomerDetailDto): string {
    const fn = c.advisorFirstName?.trim() || '';
    const ln = c.advisorLastName?.trim() || '';
    return fn && ln ? `${fn} ${ln}` : fn || ln;
  }

  editCustomer(): void {
    this.router.navigate(['/customers/editCustomer', this.id]);
  }

  async deleteCustomer(): Promise<void> {
    const ok = await this.confirm.open('Diesen Kunden wirklich löschen?', 'Löschen', 'Abbrechen');
    if (!ok) return;

    this.api.delete(`/api/customer/${this.id}`).subscribe({
      next: () => { this.toast.show('Kunde gelöscht', 'success'); this.router.navigate(['/customers']); },
      error: () => { this.toast.show('Fehler beim Löschen des Kunden', 'error'); }
    });
  }

  openAdvisorDialog(): void { this.showAdvisorDialog = true; }
  closeAdvisorDialog(): void { this.showAdvisorDialog = false; }

  confirmAdvisorChange(advisorId: number): void {
    if (!this.customer) return;

    this.api.put(`/api/customer/${this.customer.id}/advisor`, { advisorId }).subscribe({
      next: () => { this.toast.show('Berater erfolgreich geändert'); this.closeAdvisorDialog(); this.loadCustomer(); }
    });
  }

  async removeAdvisor(): Promise<void> {
    const ok = await this.confirm.open('Möchten Sie den Berater wirklich entfernen?', 'Entfernen', 'Abbrechen');
    if (!ok) return;

    this.api.put(`/api/customer/${this.id}/advisor`, { advisorId: null }).subscribe({
      next: () => { this.toast.show('Berater entfernt'); this.loadCustomer(); }
    });
  }
}
