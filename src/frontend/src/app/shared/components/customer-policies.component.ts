import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PolicyService, PolicyDto, CreatePolicyDto, PolicyType, PaymentFrequency, MutationReason } from '../../core/services/policy.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService } from '../../core/services/permission.service';

interface CompanyOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card policies-card">
      <div class="card-header">
        <h2>Policen</h2>
        <button class="add-btn" (click)="openCreateDialog()" *ngIf="canEdit">
          + Neu
        </button>
      </div>

      <!-- Multi-step Create Dialog -->
      <div class="modal" *ngIf="showCreateDialog" (click)="closeCreateDialog()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Police hinzufügen</h3>
          
          <!-- Step 1: Type -->
          <div *ngIf="currentStep === 1">
            <div class="form-group">
              <label>Typ *</label>
              <select [(ngModel)]="newPolicy.type" class="form-control">
                <option [value]="null" disabled>Typ auswählen</option>
                <option [value]="PolicyType.Haushalt">Haushalt</option>
                <option [value]="PolicyType.Krankenkasse">Krankenkasse</option>
                <option [value]="PolicyType.Motorfahrzeugversicherung">Motorfahrzeugversicherung</option>
                <option [value]="PolicyType.Rechtsschutz">Rechtsschutz</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn secondary" (click)="closeCreateDialog()">Abbrechen</button>
              <button class="btn primary" (click)="nextStep()" [disabled]="newPolicy.type === null">
                Weiter
              </button>
            </div>
          </div>

          <!-- Step 2: Company -->
          <div *ngIf="currentStep === 2">
            <div class="form-group">
              <label>Gesellschaft *</label>
              <select [(ngModel)]="newPolicy.company" class="form-control">
                <option value="" disabled>Gesellschaft auswählen</option>
                <option *ngFor="let company of getCompanyOptions()" [value]="company.value">
                  {{ company.label }}
                </option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn secondary" (click)="previousStep()">Zurück</button>
              <button class="btn primary" (click)="nextStep()" [disabled]="!newPolicy.company">
                Weiter
              </button>
            </div>
          </div>

          <!-- Step 3: Organizational Unit -->
          <div *ngIf="currentStep === 3">
            <div class="form-group">
              <label>Organisationseinheit *</label>
              <select [(ngModel)]="newPolicy.organizationalUnit" class="form-control">
                <option value="" disabled>Organisationseinheit auswählen</option>
                <option value="Eigenverwaltete Verträge">Eigenverwaltete Verträge</option>
                <option value="Fremdverwaltete Verträge">Fremdverwaltete Verträge</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn secondary" (click)="previousStep()">Zurück</button>
              <button class="btn primary" (click)="nextStep()" [disabled]="!newPolicy.organizationalUnit">
                Weiter
              </button>
            </div>
          </div>

          <!-- Step 4: Detailed Information -->
          <div *ngIf="currentStep === 4">
            <div class="form-group">
              <label>Policen-Nummer *</label>
              <input type="text" [(ngModel)]="newPolicy.policyNumber" class="form-control" placeholder="z.B. POL-12345" />
            </div>
            <div class="form-group">
              <label>Produktname</label>
              <input type="text" [(ngModel)]="newPolicy.productName" class="form-control" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Mutationsgrund</label>
              <select [(ngModel)]="newPolicy.mutationReason" class="form-control">
                <option [value]="null">- Auswählen -</option>
                <option [value]="MutationReason.Unbekannt">Unbekannt</option>
                <option [value]="MutationReason.Neugeschaft">Neugeschäft</option>
                <option [value]="MutationReason.Mutation">Mutation</option>
                <option [value]="MutationReason.Bestandsubernahme">Bestandsübernahme</option>
                <option [value]="MutationReason.Ersatz">Ersatz</option>
              </select>
            </div>
            <div class="form-group">
              <label>Kundennummer</label>
              <input type="text" [(ngModel)]="newPolicy.customerNumber" class="form-control" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Beginn</label>
              <input type="date" [(ngModel)]="newPolicy.startDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Ende</label>
              <input type="date" [(ngModel)]="newPolicy.endDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Zahlungsweise</label>
              <select [(ngModel)]="newPolicy.paymentFrequency" class="form-control">
                <option [value]="null">-</option>
                <option [value]="PaymentFrequency.Monatlich">monatlich</option>
                <option [value]="PaymentFrequency.ZweiMonatlich">2-monatlich</option>
                <option [value]="PaymentFrequency.Vierteljahrlich">vierteljährlich</option>
                <option [value]="PaymentFrequency.Halbjahrlich">halbjährlich</option>
                <option [value]="PaymentFrequency.Jahrlich">jährlich</option>
                <option [value]="PaymentFrequency.Einmaleinlage">Einmaleinlage</option>
              </select>
            </div>
            <div class="form-group">
              <label>Jahresprämie (CHF)</label>
              <input type="number" [(ngModel)]="newPolicy.annualPremium" class="form-control" placeholder="0.00" step="0.01" />
            </div>
            <div class="form-group">
              <label>Berater</label>
              <input type="text" [(ngModel)]="newPolicy.advisor" class="form-control" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <input type="text" [(ngModel)]="newPolicy.status" class="form-control" placeholder="z.B. Aktiv, Gekündigt" />
            </div>
            <div class="modal-actions">
              <button class="btn secondary" (click)="previousStep()">Zurück</button>
              <button class="btn primary" (click)="confirmCreate()" [disabled]="!newPolicy.policyNumber || creating">
                {{ creating ? 'Erstellen...' : 'Erstellen' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Policen...</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && policies.length === 0" class="empty-state">
        <p>Keine Policen vorhanden.</p>
      </div>

      <div *ngIf="!loading && !error && policies.length > 0" class="policies-list">
        <div class="policies-table">
          <div class="table-header">
            <div class="col">Police Nr</div>
            <div class="col">Typ</div>
            <div class="col">Gesellschaft</div>
            <div class="col">Beginn</div>
            <div class="col">Ablauf</div>
            <div class="col">Jahresprämie</div>
            <div class="col">Berater</div>
            <div class="col">Status</div>
            <div class="col-icon">Dok</div>
            <div class="col-actions"></div>
          </div>
          <div *ngFor="let policy of policies" class="table-row" (click)="viewPolicy(policy.id)">
            <div class="col">{{ policy.policyNumber }}</div>
            <div class="col">{{ policy.typeDisplay }}</div>
            <div class="col">{{ policy.company }}</div>
            <div class="col">{{ formatDate(policy.startDate) }}</div>
            <div class="col">{{ formatDate(policy.endDate) }}</div>
            <div class="col">{{ formatCurrency(policy.annualPremium) }}</div>
            <div class="col">{{ policy.advisor || '-' }}</div>
            <div class="col">{{ policy.status || '-' }}</div>
            <div class="col-icon">
              <button 
                *ngIf="policy.documentId" 
                class="doc-icon-btn" 
                (click)="viewDocument($event, policy.documentId!)"
                title="Dokument anzeigen"
              >
                📄
              </button>
            </div>
            <div class="col-actions" (click)="$event.stopPropagation()">
              <button class="icon-btn danger" (click)="deletePolicy(policy)" title="Löschen" *ngIf="canDelete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .policies-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.1rem 1.25rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .9rem;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #111827;
    }

    .add-btn {
      display: inline-flex;
      align-items: center;
      padding: .4rem 1rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color .15s ease;
    }

    .add-btn:hover {
      background: #1d4ed8;
    }

    .state-msg {
      text-align: center;
      padding: 1.5rem;
      color: #6b7280;
      font-size: .9rem;
    }

    .state-msg.error {
      color: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-style: italic;
    }

    .policies-list {
      overflow-x: auto;
    }

    .policies-table {
      min-width: 100%;
      font-size: .85rem;
    }

    .table-header {
      display: grid;
      grid-template-columns: 120px 140px 120px 90px 90px 110px 100px 90px 40px 40px;
      gap: .5rem;
      padding: .5rem;
      background: #f9fafb;
      border-radius: 6px;
      font-weight: 600;
      color: #374151;
      margin-bottom: .3rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 120px 140px 120px 90px 90px 110px 100px 90px 40px 40px;
      gap: .5rem;
      padding: .5rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: .3rem;
      cursor: pointer;
      transition: background-color .15s ease;
      align-items: center;
    }

    .table-row:hover {
      background-color: #f9fafb;
    }

    .col {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .col-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .doc-icon-btn {
      border: none;
      background: transparent;
      font-size: 1.2rem;
      cursor: pointer;
      padding: .2rem;
      transition: transform .15s ease;
    }

    .doc-icon-btn:hover {
      transform: scale(1.2);
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s ease;
    }

    .icon-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .icon-btn.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #111827;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: Arial, sans-serif;
    }

    .modal-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn.primary {
      background: #2563eb;
      color: white;
    }

    .btn.primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn.secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn.secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class CustomerPoliciesComponent implements OnInit {
  @Input() customerId!: number;

  policies: PolicyDto[] = [];
  loading = false;
  creating = false;
  error = '';
  canEdit = false;
  canDelete = false;
  showCreateDialog = false;
  currentStep = 1;

  // Expose enums to template
  PolicyType = PolicyType;
  PaymentFrequency = PaymentFrequency;
  MutationReason = MutationReason;

  newPolicy: Partial<CreatePolicyDto> = {
    type: null as any,
    company: '',
    organizationalUnit: '',
    policyNumber: '',
    productName: '',
    mutationReason: null as any,
    customerNumber: '',
    startDate: undefined,
    endDate: undefined,
    paymentFrequency: null as any,
    annualPremium: undefined,
    advisor: '',
    status: ''
  };

  constructor(
    private policyService: PolicyService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canEdit = this.permissionService.canEditCustomers();
    this.canDelete = this.permissionService.canDeleteCustomers();
    if (this.customerId) {
      this.loadPolicies();
    }
  }

  loadPolicies(): void {
    this.loading = true;
    this.error = '';
    this.policyService.getByCustomerId(this.customerId).subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Policen';
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    this.showCreateDialog = true;
    this.currentStep = 1;
    this.resetNewPolicy();
  }

  closeCreateDialog(): void {
    this.showCreateDialog = false;
    this.currentStep = 1;
    this.resetNewPolicy();
  }

  resetNewPolicy(): void {
    this.newPolicy = {
      type: null as any,
      company: '',
      organizationalUnit: '',
      policyNumber: '',
      productName: '',
      mutationReason: null as any,
      customerNumber: '',
      startDate: undefined,
      endDate: undefined,
      paymentFrequency: null as any,
      annualPremium: undefined,
      advisor: '',
      status: ''
    };
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getCompanyOptions(): CompanyOption[] {
    switch (this.newPolicy.type) {
      case PolicyType.Krankenkasse:
        return [
          { value: 'AXA', label: 'AXA' },
          { value: 'CSS', label: 'CSS' },
          { value: 'Helsana', label: 'Helsana' },
          { value: 'Visana', label: 'Visana' }
        ];
      case PolicyType.Motorfahrzeugversicherung:
        return [
          { value: 'AXA', label: 'AXA' },
          { value: 'Allianz', label: 'Allianz' },
          { value: 'Generali', label: 'Generali' },
          { value: 'Zurich', label: 'Zurich' }
        ];
      case PolicyType.Rechtsschutz:
        return [
          { value: 'AXA', label: 'AXA' },
          { value: 'Dextra', label: 'Dextra' },
          { value: 'Orion', label: 'Orion' }
        ];
      case PolicyType.Haushalt:
        return [
          { value: 'AXA', label: 'AXA' },
          { value: 'Mobiliar', label: 'Mobiliar' },
          { value: 'Helvetia', label: 'Helvetia' },
          { value: 'Zurich', label: 'Zurich' }
        ];
      default:
        return [];
    }
  }

  confirmCreate(): void {
    if (!this.newPolicy.policyNumber || this.newPolicy.type === null) {
      this.toast.show('Bitte füllen Sie alle Pflichtfelder aus', 'error');
      return;
    }

    const policyData: CreatePolicyDto = {
      policyNumber: this.newPolicy.policyNumber,
      type: this.newPolicy.type!,
      company: this.newPolicy.company!,
      organizationalUnit: this.newPolicy.organizationalUnit!,
      productName: this.newPolicy.productName || undefined,
      mutationReason: this.newPolicy.mutationReason || undefined,
      customerNumber: this.newPolicy.customerNumber || undefined,
      startDate: this.newPolicy.startDate || undefined,
      endDate: this.newPolicy.endDate || undefined,
      paymentFrequency: this.newPolicy.paymentFrequency || undefined,
      annualPremium: this.newPolicy.annualPremium || undefined,
      advisor: this.newPolicy.advisor || undefined,
      status: this.newPolicy.status || undefined,
      customerId: this.customerId
    };

    this.creating = true;
    this.policyService.create(policyData).subscribe({
      next: () => {
        this.toast.show('Police erfolgreich erstellt', 'success');
        this.creating = false;
        this.closeCreateDialog();
        this.loadPolicies();
      },
      error: () => {
        this.toast.show('Fehler beim Erstellen der Police', 'error');
        this.creating = false;
      }
    });
  }

  async deletePolicy(policy: PolicyDto): Promise<void> {
    const ok = await this.confirm.open(
      `Police "${policy.policyNumber}" wirklich löschen?`,
      'Löschen',
      'Abbrechen'
    );
    if (!ok) return;

    this.policyService.delete(policy.id).subscribe({
      next: () => {
        this.toast.show('Police gelöscht', 'success');
        this.loadPolicies();
      },
      error: () => {
        this.toast.show('Fehler beim Löschen der Police', 'error');
      }
    });
  }

  viewPolicy(id: number): void {
    this.router.navigate(['/policy', id]);
  }

  viewDocument(event: Event, documentId: number): void {
    event.stopPropagation();
    // TODO: Implement document viewing logic
    console.log('View document:', documentId);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(amount?: number): string {
    if (amount == null) return '-';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  }
}
