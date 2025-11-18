import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AdvisorChangeDialogComponent } from '../../shared/components/advisor-change-dialog.component';
import { CustomerDocumentsComponent } from '../../shared/components/customer-documents.component';
import { CustomerTasksComponent } from '../../shared/components/customer-tasks.component';
import { CustomerRelationshipsComponent } from '../../shared/components/customer-relationships.component';
import { PermissionService } from '../../core/services/permission.service';
import { CustomerRelationshipService } from '../../core/services/customer-relationship.service';

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

  civilStatus?: string | null;
  religion?: string | null;
  gender?: string | null;
  salutation?: string | null;
  birthDate?: string | null;
  profession?: string | null;
  language?: string | null;
  
  // Address fields
  street?: string | null;
  postalCode?: string | null;
  locality?: string | null;
  canton?: string | null;
  
  isPrimaryContact: boolean;

  tenantId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvisorChangeDialogComponent, CustomerDocumentsComponent, CustomerTasksComponent, CustomerRelationshipsComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Kundendetails</h1>
          <p class="subline">
            {{ getHeaderDisplay(customer) }}
          </p>
          <span *ngIf="isPrimaryContact" class="primary-contact-badge">Hauptansprechperson</span>
        </div>

        <div class="header-actions">
          <button class="btn ghost" type="button" (click)="editCustomer()">Bearbeiten</button>
          <button class="btn danger" type="button" (click)="deleteCustomer()" *ngIf="canDelete">Löschen</button>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Kundendaten…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && customer" class="layout">

        <!-- linke Spalte -->
        <div class="left-column">

          <!-- Stammdaten -->
          <section class="card">
            <div class="card-header">
              <h2>Stammdaten</h2>
            </div>
            <dl class="detail-list">

              <!-- Hauptansprechperson Checkbox -->
              <div class="double-row">
                <div class="primary-contact-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      [checked]="customer.isPrimaryContact"
                      (change)="togglePrimaryContact()"
                    />
                    <span>Hauptansprechperson</span>
                  </label>
                </div>
                <div></div>
              </div>

              <!-- Anrede + Sprache -->
              <div class="double-row">
                <div>
                  <dt>Anrede</dt>
                  <dd>{{ customer.salutation }}</dd>
                </div>
                <div>
                  <dt>Sprache</dt>
                  <dd>{{ customer.language }}</dd>
                </div>
              </div>

              <!-- Vorname + Nachname -->
              <div class="double-row">
                <div>
                  <dt>Vorname</dt>
                  <dd>{{ customer.firstName }}</dd>
                </div>
                <div>
                  <dt>Nachname</dt>
                  <dd>{{ customer.name }}</dd>
                </div>
              </div>

              <!-- E-Mail + AHV-Nummer -->
              <div class="double-row">
                <div>
                  <dt>E-Mail</dt>
                  <dd>
                    <a *ngIf="customer.email" class="link" href="mailto:{{ customer.email }}">
                      {{ customer.email }}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>AHV-Nummer</dt>
                  <dd>{{ customer.ahvNum }}</dd>
                </div>
              </div>

              <!-- Erstellt + Zuletzt geändert -->
              <div class="double-row">
                <div>
                  <dt>Erstellt am</dt>
                  <dd>{{ customer.createdAt | date: 'dd.MM.yyyy, HH:mm' }}</dd>
                </div>
                <div>
                  <dt>Zuletzt geändert</dt>
                  <dd>{{ customer.updatedAt | date: 'dd.MM.yyyy, HH:mm' }}</dd>
                </div>
              </div>

            </dl>
          </section>

          <!-- Persönliche Angaben -->
          <section class="card">
            <div class="card-header">
              <h2>Persönliche Angaben</h2>
            </div>
            <dl class="detail-list">

              <!-- Zivilstand + Konfession -->
              <div class="double-row">
                <div>
                  <dt>Zivilstand</dt>
                  <dd>{{ customer.civilStatus || '–' }}</dd>
                </div>
                <div>
                  <dt>Konfession</dt>
                  <dd>{{ customer.religion || '–' }}</dd>
                </div>
              </div>

              <!-- Geschlecht + Geburtsdatum -->
              <div class="double-row">
                <div>
                  <dt>Geschlecht</dt>
                  <dd>{{ customer.gender || '–' }}</dd>
                </div>
                <div>
                  <dt>Geburtsdatum</dt>
                  <dd>{{ customer.birthDate ? (customer.birthDate | date: 'dd.MM.yyyy') : '–' }}</dd>
                </div>
              </div>

              <!-- Beruf + rechte Seite leer -->
              <div class="double-row">
                <div>
                  <dt>Beruf</dt>
                  <dd>{{ customer.profession || '–' }}</dd>
                </div>
                <div></div>
              </div>

              <!-- Address Section -->
              <div class="address-section">
                <h3>Adresse</h3>
              </div>

              <!-- Strasse + PLZ -->
              <div class="double-row">
                <div>
                  <dt>Strasse</dt>
                  <dd>{{ customer.street || '–' }}</dd>
                </div>
                <div>
                  <dt>PLZ</dt>
                  <dd>{{ customer.postalCode || '–' }}</dd>
                </div>
              </div>

              <!-- Ort + Kanton -->
              <div class="double-row">
                <div>
                  <dt>Ort</dt>
                  <dd>{{ customer.locality || '–' }}</dd>
                </div>
                <div>
                  <dt>Kanton</dt>
                  <dd>{{ customer.canton || '–' }}</dd>
                </div>
              </div>

            </dl>
          </section>

          <!-- Relationships Section -->
          <section class="card">
            <app-customer-relationships [customerId]="customer.id"></app-customer-relationships>
          </section>

        </div>

        <!-- rechte Spalte: Berater (unverändert) -->
        <aside class="advisor-column">
          <section class="card advisor-card">
            <div class="advisor-header">
              <div class="avatar">
                <span>{{ getAdvisorInitials(customer) }}</span>
              </div>
              <div class="advisor-info">
                <div class="advisor-title-row">
                  <h2>Hauptberater</h2>
                  <span
                    *ngIf="customer.advisorIsActive === false"
                    class="badge badge-inactive"
                  >
                    Inaktiv
                  </span>
                </div>
                <p class="advisor-name">
                  {{ getAdvisorName(customer) || 'Kein Berater zugewiesen' }}
                </p>
              </div>
            </div>

            <div class="advisor-body" *ngIf="customer.advisorId; else noAdvisorBlock">
              <dl class="detail-list compact">
                <div class="row">
                  <dt>E-Mail</dt>
                  <dd>
                    <a *ngIf="customer.advisorEmail" class="link" href="mailto:{{ customer.advisorEmail }}">
                      {{ customer.advisorEmail }}
                    </a>
                  </dd>
                </div>
                <div class="row" *ngIf="customer.advisorPhone">
                  <dt>Telefon</dt>
                  <dd>{{ customer.advisorPhone }}</dd>
                </div>
              </dl>
            </div>

            <ng-template #noAdvisorBlock>
              <p class="advisor-empty">Kein Berater hinterlegt.</p>
            </ng-template>

            <div class="advisor-actions-footer">
              <button class="link-btn" type="button" (click)="openAdvisorDialog()">Berater wechseln</button>
              <button
                class="link-btn danger"
                type="button"
                *ngIf="customer.advisorId"
                (click)="removeAdvisor()"
              >
                Entfernen
              </button>
            </div>
          </section>

          <!-- Documents Section -->
          <app-customer-documents [customerId]="customer.id"></app-customer-documents>

          <!-- Tasks Section -->
          <app-customer-tasks [customerId]="customer.id"></app-customer-tasks>
        </aside>
      </div>

      <app-advisor-change-dialog
        *ngIf="showAdvisorDialog"
        (confirmed)="confirmAdvisorChange($event)"
        (closed)="closeAdvisorDialog()">
      </app-advisor-change-dialog>
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

    .primary-contact-badge {
      display: inline-block;
      padding: .25rem .7rem;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
      background: #dbeafe;
      color: #1e40af;
      margin-top: .4rem;
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
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(280px, 1.2fr);
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    .left-column {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .advisor-column {
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

    .detail-list .row {
      display: grid;
      grid-template-columns: 160px minmax(0, 1fr);
      padding: .3rem 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: .9rem;
    }

    .detail-list .row:last-child {
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

    .detail-list.compact .row {
      grid-template-columns: 110px minmax(0, 1fr);
    }

    .link {
      color: #2563eb;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }

    .advisor-card {
      padding: 1.25rem 1.4rem;
    }

    .advisor-header {
      display: flex;
      align-items: center;
      gap: .9rem;
      margin-bottom: .7rem;
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 999px;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #4b5563;
      font-size: 1.1rem;
    }

    .advisor-info {
      flex: 1;
      min-width: 0;
    }

    .advisor-title-row {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-bottom: .15rem;
    }

    .advisor-title-row h2 {
      margin: 0;
      font-size: .95rem;
      font-weight: 600;
      color: #111827;
    }

    .advisor-name {
      margin: 0;
      font-size: .95rem;
      color: #111827;
      font-weight: 500;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: .1rem .55rem;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .02em;
    }

    .badge-inactive {
      background: #fee2e2;
      color: #b91c1c;
    }

    .advisor-body {
      margin-top: .4rem;
    }

    .advisor-empty {
      margin: .5rem 0 .2rem;
      font-size: .9rem;
      color: #6b7280;
      font-style: italic;
    }

    .advisor-actions-footer {
      display: flex;
      justify-content: flex-end;
      gap: .75rem;
      margin-top: .8rem;
    }

    .link-btn {
      border: none;
      background: none;
      padding: 0;
      font-size: .85rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
    }

    .link-btn:hover {
      text-decoration: underline;
    }

    .link-btn.danger {
      color: #b91c1c;
    }

    /* neue 2-Spalten-Layout-Zeilen */
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

    .double-row dt {
      margin: 0;
      font-weight: 600;
      color: #4b5563;
    }

    .double-row dd {
      margin: 0;
      color: #111827;
      word-break: break-word;
    }

    .primary-contact-checkbox {
      padding: 0.75rem 0;
    }

    .primary-contact-checkbox label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #111827;
    }

    .primary-contact-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #2563eb;
    }

    .primary-contact-checkbox span {
      font-size: 0.95rem;
    }

    .address-section {
      margin: 1.5rem 0 0.75rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e7eb;
    }

    .address-section h3 {
      font-size: .95rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem;
    }
  `]
})
export class CustomerDetailPage implements OnInit {
  id!: number;
  customer: CustomerDetailDto | null = null;
  loading = false;
  error = '';
  showAdvisorDialog = false;
  canDelete = false;
  isPrimaryContact = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissionService: PermissionService,
    private relationshipService: CustomerRelationshipService
  ) {}

  ngOnInit(): void {
    this.canDelete = this.permissionService.canDeleteCustomers();
    
    // Subscribe to route parameter changes to reload customer data
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      if (this.id) this.loadCustomer();
    });
  }

  loadCustomer(): void {
    this.loading = true;
    this.api.get<CustomerDetailDto>(`/api/customer/${this.id}`).subscribe({
      next: res => { 
        this.customer = res; 
        this.loading = false;
        this.checkIfPrimaryContact();
      },
      error: () => {
        this.error = 'Kunde konnte nicht geladen werden.';
        this.toast.show('Fehler beim Laden des Kunden', 'error');
        this.loading = false;
      }
    });
  }

  checkIfPrimaryContact(): void {
    this.relationshipService.isPrimaryContact(this.id).subscribe({
      next: (result) => {
        this.isPrimaryContact = result.isPrimaryContact;
      },
      error: () => {
        this.isPrimaryContact = false;
      }
    });
  }

  togglePrimaryContact(): void {
    if (!this.customer) return;
    
    const newValue = !this.customer.isPrimaryContact;
    
    this.api.put(`/api/customer/${this.customer.id}/primary-contact`, newValue).subscribe({
      next: () => {
        if (this.customer) {
          this.customer.isPrimaryContact = newValue;
          this.checkIfPrimaryContact(); // Update badge in header
          this.toast.show(
            newValue ? 'Als Hauptansprechperson markiert' : 'Hauptansprechperson-Status entfernt',
            'success'
          );
        }
      },
      error: () => {
        this.toast.show('Fehler beim Aktualisieren', 'error');
      }
    });
  }

  getHeaderDisplay(c: CustomerDetailDto | null): string {
    if (!c) return '';
    if (c.gender === 'weiblich') return `Frau ${c.firstName} ${c.name}`;
    if (c.gender === 'männlich') return `Herr ${c.firstName} ${c.name}`;
    return `${c.firstName} ${c.name}`;
  }

  getAdvisorName(c: CustomerDetailDto): string {
    const fn = c.advisorFirstName?.trim() || '';
    const ln = c.advisorLastName?.trim() || '';
    return fn && ln ? `${fn} ${ln}` : fn || ln;
  }

  getAdvisorInitials(c: CustomerDetailDto): string {
    const fn = (c.advisorFirstName || '').trim();
    const ln = (c.advisorLastName || '').trim();
    const first = fn ? fn[0] : '';
    const last = ln ? ln[0] : '';
    const combined = (first + last).toUpperCase();
    return combined || '–';
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
      next: () => {
        this.toast.show('Berater erfolgreich geändert');
        this.closeAdvisorDialog();
        this.loadCustomer();
      }
    });
  }

  async removeAdvisor(): Promise<void> {
    const ok = await this.confirm.open('Möchten Sie den Berater wirklich entfernen?', 'Entfernen', 'Abbrechen');
    if (!ok) return;

    this.api.put(`/api/customer/${this.id}/advisor`, { advisorId: null }).subscribe({
      next: () => {
        this.toast.show('Berater entfernt');
        this.loadCustomer();
      }
    });
  }
}
