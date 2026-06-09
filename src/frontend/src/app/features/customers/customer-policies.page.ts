import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService, Permission } from '../../core/services/permission.service';
import { PolicyService, PolicyDto, PolicyStatus } from '../../core/services/policy.service';

interface CustomerHeaderDto {
  id: number;
  customerNumber: string;
  customerType: number;
  firstName?: string | null;
  name?: string | null;
  companyName?: string | null;
}

interface AdvisorDto {
  id: number;
  firstName?: string | null;
  name?: string | null;
  email?: string | null;
}

interface NewPolicyForm {
  policyNumber: string;
  type: string;
  company: string;
  startDate: string;        // yyyy-MM-dd (HTML date input)
  endDate: string;          // yyyy-MM-dd or ''
  organizationalUnit: string;
  advisorUserId: number | null;
  status: PolicyStatus;
  file: File | null;
}

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Policen</h1>
          <p class="subline" *ngIf="customer">
            {{ customerLabel() }}
            <a class="back-link" [routerLink]="['/customers', customerId]">← Zurück zum Kundenprofil</a>
          </p>
        </div>

        <div class="header-actions">
          <button class="btn primary" type="button" (click)="openUpload()" *ngIf="canUpload">
            + Police hochladen
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Policen…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card table-card">
        <div *ngIf="policies.length === 0" class="empty-state">
          Keine Policen vorhanden.
        </div>

        <div *ngIf="policies.length > 0" class="table-wrapper">
          <table class="policy-table">
            <thead>
              <tr>
                <th>Policennummer</th>
                <th>Typ</th>
                <th>Gesellschaft</th>
                <th>Beginn</th>
                <th>Ablauf</th>
                <th>Organisationseinheit</th>
                <th>Berater</th>
                <th>Status</th>
                <th>Dokumente</th>
                <th *ngIf="canDelete" class="col-actions">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of policies">
                <td>{{ p.policyNumber }}</td>
                <td>{{ p.type }}</td>
                <td>{{ p.company }}</td>
                <td>{{ formatDate(p.startDate) }}</td>
                <td>{{ p.endDate ? formatDate(p.endDate) : '–' }}</td>
                <td>{{ p.organizationalUnit || '–' }}</td>
                <td>{{ p.advisorName || '–' }}</td>
                <td>
                  <span class="status-badge" [attr.data-status]="p.status">{{ p.statusLabel }}</span>
                </td>
                <td>
                  <a *ngIf="p.hasDocument; else noDoc" href="javascript:void(0)" (click)="download(p)" class="doc-link">
                    {{ p.documentFileName }}
                  </a>
                  <ng-template #noDoc>–</ng-template>
                </td>
                <td *ngIf="canDelete" class="col-actions">
                  <button class="btn small danger" type="button" (click)="deletePolicy(p)">Löschen</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div *ngIf="showUpload" class="modal-backdrop" (click)="closeUpload($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Police hochladen</h2>
          <button class="icon-btn" type="button" (click)="showUpload = false" aria-label="Schließen">×</button>
        </div>

        <form class="modal-body" (ngSubmit)="submitUpload()" #f="ngForm">
          <div class="grid-2">
            <div class="form-group">
              <label>Policennummer *</label>
              <input class="form-control" name="policyNumber" [(ngModel)]="form.policyNumber" required maxlength="100" />
            </div>
            <div class="form-group">
              <label>Typ *</label>
              <input class="form-control" name="type" [(ngModel)]="form.type" required maxlength="100" />
            </div>
            <div class="form-group">
              <label>Gesellschaft *</label>
              <input class="form-control" name="company" [(ngModel)]="form.company" required maxlength="200" />
            </div>
            <div class="form-group">
              <label>Organisationseinheit</label>
              <input class="form-control" name="organizationalUnit" [(ngModel)]="form.organizationalUnit" maxlength="150" />
            </div>
            <div class="form-group">
              <label>Beginn *</label>
              <input class="form-control" type="date" name="startDate" [(ngModel)]="form.startDate" required />
            </div>
            <div class="form-group">
              <label>Ablauf</label>
              <input class="form-control" type="date" name="endDate" [(ngModel)]="form.endDate" />
            </div>
            <div class="form-group">
              <label>Berater</label>
              <select class="form-control" name="advisorUserId" [(ngModel)]="form.advisorUserId">
                <option [ngValue]="null">–</option>
                <option *ngFor="let a of advisors" [ngValue]="a.id">{{ advisorLabel(a) }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status *</label>
              <select class="form-control" name="status" [(ngModel)]="form.status" required>
                <option [ngValue]="0">Aktiv</option>
                <option [ngValue]="1">Sistiert</option>
                <option [ngValue]="2">Gekündigt</option>
                <option [ngValue]="3">Abgelaufen</option>
              </select>
            </div>
            <div class="form-group span-2">
              <label>Dokument (PDF) *</label>
              <input class="form-control" type="file" name="file" (change)="onFile($event)" required />
              <small *ngIf="form.file" class="muted">{{ form.file.name }} ({{ formatBytes(form.file.size) }})</small>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="showUpload = false">Abbrechen</button>
            <button type="submit" class="btn primary" [disabled]="!isFormValid() || saving">
              {{ saving ? 'Wird hochgeladen…' : 'Hochladen' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
    .page-header h1 { margin: 0 0 .25rem; font-size: 1.5rem; }
    .subline { margin: 0; color: #5a6478; font-size: .9rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
    .back-link { color: #0f70ff; text-decoration: none; font-size: .85rem; }
    .back-link:hover { text-decoration: underline; }

    .state-msg { padding: 1rem; color: #5a6478; }
    .state-msg.error { color: #c0392b; }

    .card { background: #fff; border: 1px solid #e2e6ee; border-radius: 8px; }
    .table-card { padding: 0; }
    .empty-state { padding: 2rem; text-align: center; color: #7a8497; }

    .table-wrapper { overflow-x: auto; }
    .policy-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .policy-table th, .policy-table td { padding: .65rem .85rem; text-align: left; border-bottom: 1px solid #eef0f5; vertical-align: middle; }
    .policy-table th { background: #f7f9fc; font-weight: 600; color: #344055; }
    .policy-table tr:last-child td { border-bottom: none; }
    .col-actions { width: 1%; white-space: nowrap; text-align: right; }

    .status-badge { display: inline-block; padding: .15rem .5rem; border-radius: 999px; font-size: .75rem; font-weight: 600; background: #eef2f7; color: #344055; }
    .status-badge[data-status="0"] { background: #e6f7ec; color: #1e8449; }
    .status-badge[data-status="1"] { background: #fff4e0; color: #b8730d; }
    .status-badge[data-status="2"] { background: #fde7e7; color: #b3261e; }
    .status-badge[data-status="3"] { background: #ececec; color: #555; }

    .doc-link { color: #0f70ff; text-decoration: none; }
    .doc-link:hover { text-decoration: underline; }

    .btn { padding: .45rem .9rem; border-radius: 6px; border: 1px solid transparent; cursor: pointer; font-size: .9rem; }
    .btn.primary { background: #0f70ff; color: #fff; }
    .btn.primary:disabled { background: #9bbcf5; cursor: not-allowed; }
    .btn.ghost { background: #fff; border-color: #cdd3df; color: #344055; }
    .btn.danger { background: #fff; border-color: #d75252; color: #b3261e; }
    .btn.danger:hover { background: #fde7e7; }
    .btn.small { padding: .25rem .6rem; font-size: .8rem; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(20,24,33,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 8px; width: min(720px, 92vw); max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid #e2e6ee; }
    .modal-header h2 { margin: 0; font-size: 1.15rem; }
    .icon-btn { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #5a6478; }
    .modal-body { padding: 1.25rem; overflow-y: auto; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem 1rem; }
    .span-2 { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: .3rem; }
    .form-group label { font-size: .8rem; color: #5a6478; font-weight: 600; }
    .form-control { padding: .5rem .65rem; border: 1px solid #cdd3df; border-radius: 6px; font-size: .9rem; }
    .form-control:focus { outline: none; border-color: #0f70ff; }
    .muted { color: #5a6478; font-size: .78rem; }

    .modal-actions { display: flex; justify-content: flex-end; gap: .6rem; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #eef0f5; }
  `]
})
export class CustomerPoliciesPage implements OnInit {
  customerId!: number;
  customer: CustomerHeaderDto | null = null;
  policies: PolicyDto[] = [];
  advisors: AdvisorDto[] = [];

  loading = true;
  error: string | null = null;

  canUpload = false;
  canDelete = false;

  showUpload = false;
  saving = false;
  form: NewPolicyForm = this.emptyForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissions: PermissionService,
    private policyService: PolicyService
  ) {}

  ngOnInit(): void {
    this.canUpload = this.permissions.hasPermission(Permission.UploadDocuments);
    this.canDelete = this.permissions.hasPermission(Permission.DeleteCustomers);

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      const id = idStr ? parseInt(idStr, 10) : NaN;
      if (!id || isNaN(id)) {
        this.router.navigate(['/customers']);
        return;
      }
      this.customerId = id;
      this.loadAll();
    });
  }

  private loadAll(): void {
    this.loading = true;
    this.error = null;
    this.api.get<CustomerHeaderDto>(`/api/customers/${this.customerId}`).subscribe({
      next: c => { this.customer = c; },
      error: () => { /* header is non-critical */ }
    });
    this.api.get<AdvisorDto[]>(`/api/user/advisors`).subscribe({
      next: list => { this.advisors = list || []; },
      error: () => { this.advisors = []; }
    });
    this.policyService.list(this.customerId).subscribe({
      next: list => {
        this.policies = list || [];
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Policen konnten nicht geladen werden';
        this.loading = false;
      }
    });
  }

  openUpload(): void {
    this.form = this.emptyForm();
    this.showUpload = true;
  }

  closeUpload(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.showUpload = false;
    }
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.file = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  isFormValid(): boolean {
    return !!(this.form.policyNumber && this.form.type && this.form.company && this.form.startDate && this.form.file);
  }

  submitUpload(): void {
    if (!this.isFormValid() || !this.form.file) return;
    this.saving = true;
    this.policyService.create(this.customerId, {
      policyNumber: this.form.policyNumber.trim(),
      type: this.form.type.trim(),
      company: this.form.company.trim(),
      startDate: this.form.startDate,
      endDate: this.form.endDate || null,
      organizationalUnit: this.form.organizationalUnit?.trim() || null,
      advisorUserId: this.form.advisorUserId,
      status: this.form.status,
      file: this.form.file
    }).subscribe({
      next: created => {
        this.policies = [created, ...this.policies];
        this.showUpload = false;
        this.saving = false;
        this.toast.show('Police wurde erstellt', 'success');
      },
      error: err => {
        this.saving = false;
        this.toast.show(err?.error?.message || 'Police konnte nicht erstellt werden', 'error');
      }
    });
  }

  download(p: PolicyDto): void {
    if (!p.hasDocument) return;
    this.policyService.downloadDocument(this.customerId, p.id, p.documentFileName || `Police-${p.policyNumber}.pdf`);
  }

  deletePolicy(p: PolicyDto): void {
    this.confirm.open(
      `Police ${p.policyNumber} wird in der Übersicht ausgeblendet. Möchten Sie fortfahren?`,
      'Löschen',
      'Abbrechen'
    ).then(ok => {
      if (!ok) return;
      this.policyService.delete(this.customerId, p.id).subscribe({
        next: () => {
          this.policies = this.policies.filter(x => x.id !== p.id);
          this.toast.show('Police wurde gelöscht', 'success');
        },
        error: err => {
          this.toast.show(err?.error?.message || 'Löschen fehlgeschlagen', 'error');
        }
      });
    });
  }

  customerLabel(): string {
    if (!this.customer) return '';
    if (this.customer.customerType === 1) {
      return `${this.customer.customerNumber} · ${this.customer.companyName ?? ''}`.trim();
    }
    const name = [this.customer.firstName, this.customer.name].filter(Boolean).join(' ');
    return `${this.customer.customerNumber} · ${name}`.trim();
  }

  advisorLabel(a: AdvisorDto): string {
    const name = [a.firstName, a.name].filter(Boolean).join(' ').trim();
    return name || a.email || `User #${a.id}`;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  private emptyForm(): NewPolicyForm {
    return {
      policyNumber: '',
      type: '',
      company: '',
      startDate: '',
      endDate: '',
      organizationalUnit: '',
      advisorUserId: null,
      status: PolicyStatus.Active,
      file: null
    };
  }
}
