import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PolicyService, PolicyDto, UpdatePolicyDto, PolicyType, PaymentFrequency, MutationReason } from '../../core/services/policy.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Policen-Details</h1>
          <p class="subline" *ngIf="policy">
            {{ policy.policyNumber }} - {{ policy.typeDisplay }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn ghost" type="button" (click)="goBack()">Zurück</button>
          <button class="btn ghost" type="button" (click)="editMode = !editMode" *ngIf="canEdit">
            {{ editMode ? 'Abbrechen' : 'Bearbeiten' }}
          </button>
          <button class="btn primary" type="button" (click)="saveChanges()" *ngIf="editMode && canEdit">
            Speichern
          </button>
          <button class="btn danger" type="button" (click)="deletePolicy()" *ngIf="canDelete">Löschen</button>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Police-Daten…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && policy" class="layout">
        <div class="content">
          <section class="card">
            <div class="card-header">
              <h2>Policen-Informationen</h2>
            </div>
            <dl class="detail-list">
              <!-- Policen-Nummer -->
              <div class="double-row">
                <div>
                  <dt>Policen-Nummer</dt>
                  <dd *ngIf="!editMode">{{ policy.policyNumber }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.policyNumber" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Typ</dt>
                  <dd *ngIf="!editMode">{{ policy.typeDisplay }}</dd>
                  <dd *ngIf="editMode">
                    <select [(ngModel)]="editData.type" class="form-input">
                      <option [value]="PolicyType.Haushalt">Haushalt</option>
                      <option [value]="PolicyType.Krankenkasse">Krankenkasse</option>
                      <option [value]="PolicyType.Motorfahrzeugversicherung">Motorfahrzeugversicherung</option>
                      <option [value]="PolicyType.Rechtsschutz">Rechtsschutz</option>
                    </select>
                  </dd>
                </div>
              </div>

              <!-- Gesellschaft + Organisationseinheit -->
              <div class="double-row">
                <div>
                  <dt>Gesellschaft</dt>
                  <dd *ngIf="!editMode">{{ policy.company }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.company" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Organisationseinheit</dt>
                  <dd *ngIf="!editMode">{{ policy.organizationalUnit }}</dd>
                  <dd *ngIf="editMode">
                    <select [(ngModel)]="editData.organizationalUnit" class="form-input">
                      <option value="Eigenverwaltete Verträge">Eigenverwaltete Verträge</option>
                      <option value="Fremdverwaltete Verträge">Fremdverwaltete Verträge</option>
                    </select>
                  </dd>
                </div>
              </div>

              <!-- Produktname + Mutationsgrund -->
              <div class="double-row">
                <div>
                  <dt>Produktname</dt>
                  <dd *ngIf="!editMode">{{ policy.productName || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.productName" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Mutationsgrund</dt>
                  <dd *ngIf="!editMode">{{ policy.mutationReasonDisplay || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <select [(ngModel)]="editData.mutationReason" class="form-input">
                      <option [value]="null">- Auswählen -</option>
                      <option [value]="MutationReason.Unbekannt">Unbekannt</option>
                      <option [value]="MutationReason.Neugeschaft">Neugeschäft</option>
                      <option [value]="MutationReason.Mutation">Mutation</option>
                      <option [value]="MutationReason.Bestandsubernahme">Bestandsübernahme</option>
                      <option [value]="MutationReason.Ersatz">Ersatz</option>
                    </select>
                  </dd>
                </div>
              </div>

              <!-- Kundennummer + Beginn -->
              <div class="double-row">
                <div>
                  <dt>Kundennummer</dt>
                  <dd *ngIf="!editMode">{{ policy.customerNumber || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.customerNumber" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Beginn</dt>
                  <dd *ngIf="!editMode">{{ formatDate(policy.startDate) }}</dd>
                  <dd *ngIf="editMode">
                    <input type="date" [(ngModel)]="editData.startDate" class="form-input" />
                  </dd>
                </div>
              </div>

              <!-- Ende + Zahlungsweise -->
              <div class="double-row">
                <div>
                  <dt>Ende</dt>
                  <dd *ngIf="!editMode">{{ formatDate(policy.endDate) }}</dd>
                  <dd *ngIf="editMode">
                    <input type="date" [(ngModel)]="editData.endDate" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Zahlungsweise</dt>
                  <dd *ngIf="!editMode">{{ policy.paymentFrequencyDisplay || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <select [(ngModel)]="editData.paymentFrequency" class="form-input">
                      <option [value]="null">-</option>
                      <option [value]="PaymentFrequency.Monatlich">monatlich</option>
                      <option [value]="PaymentFrequency.ZweiMonatlich">2-monatlich</option>
                      <option [value]="PaymentFrequency.Vierteljahrlich">vierteljährlich</option>
                      <option [value]="PaymentFrequency.Halbjahrlich">halbjährlich</option>
                      <option [value]="PaymentFrequency.Jahrlich">jährlich</option>
                      <option [value]="PaymentFrequency.Einmaleinlage">Einmaleinlage</option>
                    </select>
                  </dd>
                </div>
              </div>

              <!-- Jahresprämie + Berater -->
              <div class="double-row">
                <div>
                  <dt>Jahresprämie</dt>
                  <dd *ngIf="!editMode">{{ formatCurrency(policy.annualPremium) }}</dd>
                  <dd *ngIf="editMode">
                    <input type="number" [(ngModel)]="editData.annualPremium" class="form-input" step="0.01" />
                  </dd>
                </div>
                <div>
                  <dt>Berater</dt>
                  <dd *ngIf="!editMode">{{ policy.advisor || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.advisor" class="form-input" />
                  </dd>
                </div>
              </div>

              <!-- Status + Dokument -->
              <div class="double-row">
                <div>
                  <dt>Status</dt>
                  <dd *ngIf="!editMode">{{ policy.status || '–' }}</dd>
                  <dd *ngIf="editMode">
                    <input type="text" [(ngModel)]="editData.status" class="form-input" />
                  </dd>
                </div>
                <div>
                  <dt>Dokument</dt>
                  <dd>{{ policy.documentFileName || 'Kein Dokument hinterlegt' }}</dd>
                </div>
              </div>

              <!-- Erstellt + Zuletzt geändert -->
              <div class="double-row">
                <div>
                  <dt>Erstellt am</dt>
                  <dd>{{ policy.createdAt | date: 'dd.MM.yyyy, HH:mm' }}</dd>
                </div>
                <div>
                  <dt>Zuletzt geändert</dt>
                  <dd>{{ policy.updatedAt | date: 'dd.MM.yyyy, HH:mm' }}</dd>
                </div>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 1.75rem 2.5rem;
      background: #f3f4f6;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }

    .subline {
      margin-top: .15rem;
      font-size: .85rem;
      color: #6b7280;
    }

    .header-actions {
      display: flex;
      gap: .5rem;
    }

    .btn {
      border-radius: 999px;
      padding: .45rem 1.2rem;
      font-size: .85rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background-color .15s ease, box-shadow .15s ease, transform .05s ease;
    }

    .btn.ghost {
      background: #e5e7eb;
      color: #111827;
    }

    .btn.ghost:hover {
      background: #d1d5db;
    }

    .btn.primary {
      background: #2563eb;
      color: #fff;
    }

    .btn.primary:hover {
      background: #1d4ed8;
    }

    .btn.danger {
      background: #ef4444;
      color: #fff;
    }

    .btn.danger:hover {
      background: #dc2626;
    }

    .btn:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    .state-msg {
      text-align: center;
      margin-top: 2rem;
      color: #4b5563;
    }

    .state-msg.error {
      color: #b91c1c;
      font-weight: 600;
    }

    .layout {
      max-width: 1200px;
      margin: 0 auto;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.1rem 1.25rem;
    }

    .card-header {
      margin-bottom: .65rem;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #111827;
    }

    .detail-list {
      margin: 0;
    }

    .double-row {
      display: grid;
      grid-template-columns: 160px minmax(0, 1fr) 160px minmax(0, 1fr);
      padding: .3rem 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: .9rem;
      column-gap: 1.5rem;
    }

    .double-row:last-child {
      border-bottom: none;
    }

    dt {
      margin: 0;
      font-weight: 600;
      color: #4b5563;
    }

    dd {
      margin: 0;
      color: #111827;
      word-break: break-word;
    }

    .form-input {
      width: 100%;
      padding: 0.4rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: Arial, sans-serif;
    }
  `]
})
export class PolicyDetailPage implements OnInit {
  id!: number;
  policy: PolicyDto | null = null;
  loading = false;
  error = '';
  editMode = false;
  canEdit = false;
  canDelete = false;

  // Expose enums to template
  PolicyType = PolicyType;
  PaymentFrequency = PaymentFrequency;
  MutationReason = MutationReason;

  editData: Partial<UpdatePolicyDto> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.permissionService.canEditCustomers();
    this.canDelete = this.permissionService.canDeleteCustomers();
    
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      if (this.id) this.loadPolicy();
    });
  }

  loadPolicy(): void {
    this.loading = true;
    this.policyService.getById(this.id).subscribe({
      next: res => { 
        this.policy = res; 
        this.loading = false;
        this.initEditData();
      },
      error: () => {
        this.error = 'Police konnte nicht geladen werden.';
        this.toast.show('Fehler beim Laden der Police', 'error');
        this.loading = false;
      }
    });
  }

  initEditData(): void {
    if (!this.policy) return;
    this.editData = {
      policyNumber: this.policy.policyNumber,
      type: this.policy.type,
      company: this.policy.company,
      organizationalUnit: this.policy.organizationalUnit,
      productName: this.policy.productName || undefined,
      mutationReason: this.policy.mutationReason || undefined,
      customerNumber: this.policy.customerNumber || undefined,
      startDate: this.policy.startDate || undefined,
      endDate: this.policy.endDate || undefined,
      paymentFrequency: this.policy.paymentFrequency || undefined,
      annualPremium: this.policy.annualPremium || undefined,
      advisor: this.policy.advisor || undefined,
      status: this.policy.status || undefined,
      documentId: this.policy.documentId || undefined
    };
  }

  saveChanges(): void {
    if (!this.policy || !this.editData.policyNumber) {
      this.toast.show('Bitte alle Pflichtfelder ausfüllen', 'error');
      return;
    }

    const updateData: UpdatePolicyDto = {
      policyNumber: this.editData.policyNumber,
      type: this.editData.type!,
      company: this.editData.company!,
      organizationalUnit: this.editData.organizationalUnit!,
      productName: this.editData.productName,
      mutationReason: this.editData.mutationReason,
      customerNumber: this.editData.customerNumber,
      startDate: this.editData.startDate,
      endDate: this.editData.endDate,
      paymentFrequency: this.editData.paymentFrequency,
      annualPremium: this.editData.annualPremium,
      advisor: this.editData.advisor,
      status: this.editData.status,
      documentId: this.editData.documentId
    };

    this.policyService.update(this.id, updateData).subscribe({
      next: () => {
        this.toast.show('Änderungen gespeichert', 'success');
        this.editMode = false;
        this.loadPolicy();
      },
      error: () => {
        this.toast.show('Fehler beim Speichern', 'error');
      }
    });
  }

  async deletePolicy(): Promise<void> {
    const ok = await this.confirm.open(
      'Diese Police wirklich löschen?',
      'Löschen',
      'Abbrechen'
    );
    if (!ok) return;

    this.policyService.delete(this.id).subscribe({
      next: () => {
        this.toast.show('Police gelöscht', 'success');
        this.goBack();
      },
      error: () => {
        this.toast.show('Fehler beim Löschen der Police', 'error');
      }
    });
  }

  goBack(): void {
    if (this.policy) {
      this.router.navigate(['/customers', this.policy.customerId]);
    } else {
      this.router.navigate(['/customers']);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '–';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(amount?: number): string {
    if (amount == null) return '–';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  }
}
