import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  CustomerRelationshipService, 
  CustomerRelationshipDto, 
  CreateCustomerRelationshipDto,
  RelationshipTypes 
} from '../../core/services/customer-relationship.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

interface CustomerSearchResult {
  id: number;
  firstName: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-customer-relationships',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card relationships-card">
      <div class="card-header">
        <h2>Beziehungen</h2>
        <button class="add-btn" (click)="showCreateDialog = true">
          + Beziehung hinzufügen
        </button>
      </div>

      <!-- Create Relationship Dialog -->
      <div class="modal" *ngIf="showCreateDialog" (click)="showCreateDialog = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Neue Beziehung hinzufügen</h3>
          
          <div class="form-group">
            <label>Kunde suchen *</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="searchCustomers()"
              class="form-control" 
              placeholder="Name oder E-Mail eingeben..."
            />
            <div class="search-results" *ngIf="searchResults.length > 0">
              <div 
                *ngFor="let customer of searchResults" 
                class="search-result-item"
                (click)="selectCustomer(customer)"
              >
                {{ customer.firstName }} {{ customer.name }} ({{ customer.email }})
              </div>
            </div>
            <div class="selected-customer" *ngIf="selectedCustomer">
              Ausgewählt: {{ selectedCustomer.firstName }} {{ selectedCustomer.name }}
            </div>
          </div>

          <div class="form-group">
            <label>Beziehungstyp *</label>
            <select [(ngModel)]="newRelationship.relationshipType" class="form-control">
              <option value="">Bitte wählen</option>
              <option [value]="RelationshipTypes.Spouse">{{ RelationshipTypes.Spouse }}</option>
              <option [value]="RelationshipTypes.Parent">{{ RelationshipTypes.Parent }}</option>
              <option [value]="RelationshipTypes.Child">{{ RelationshipTypes.Child }}</option>
              <option [value]="RelationshipTypes.Sibling">{{ RelationshipTypes.Sibling }}</option>
              <option [value]="RelationshipTypes.SameHousehold">{{ RelationshipTypes.SameHousehold }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="newRelationship.isPrimaryContact"
              />
              Als Hauptansprechperson markieren
            </label>
          </div>

          <div class="modal-actions">
            <button class="btn secondary" (click)="cancelCreate()">Abbrechen</button>
            <button 
              class="btn primary" 
              (click)="confirmCreate()" 
              [disabled]="!selectedCustomer || !newRelationship.relationshipType || creating"
            >
              {{ creating ? 'Erstellen...' : 'Hinzufügen' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Beziehungen...</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && relationships.length === 0" class="empty-state">
        <p>Keine Beziehungen vorhanden.</p>
      </div>

      <div *ngIf="!loading && !error && relationships.length > 0" class="relationships-list">
        <!-- Group by relationship type -->
        <div *ngFor="let group of groupedRelationships" class="relationship-group">
          <h3 class="group-title">{{ group.type }}</h3>
          <div *ngFor="let rel of group.relationships" class="relationship-item">
            <div class="relationship-info">
              <span 
                class="customer-name" 
                (click)="navigateToCustomer(rel.relatedCustomerId)"
                title="Zu diesem Kunden navigieren"
              >
                {{ rel.relatedCustomerFirstName }} {{ rel.relatedCustomerLastName }}
              </span>
              <span *ngIf="rel.isPrimaryContact" class="badge primary-badge">Hauptansprechperson</span>
            </div>
            <button class="delete-btn-small" (click)="deleteRelationship(rel)" title="Entfernen">
              ✕
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .relationships-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.1rem 1.25rem;
      margin-top: 1rem;
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
      font-weight: 500;
      cursor: pointer;
      transition: background .15s ease;
    }

    .add-btn:hover {
      background: #1d4ed8;
    }

    .state-msg {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
      font-size: .9rem;
    }

    .state-msg.error {
      color: #dc2626;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
    }

    .empty-state p {
      margin: 0;
      font-size: .9rem;
    }

    .relationships-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .relationship-group {
      border-left: 3px solid #e5e7eb;
      padding-left: 1rem;
    }

    .group-title {
      margin: 0 0 .5rem 0;
      font-size: .9rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: .03em;
    }

    .relationship-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .6rem .8rem;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: .4rem;
    }

    .relationship-info {
      display: flex;
      align-items: center;
      gap: .6rem;
    }

    .customer-name {
      font-size: .9rem;
      font-weight: 500;
      color: #2563eb;
      cursor: pointer;
      transition: color .15s ease;
    }

    .customer-name:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: .15rem .5rem;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 600;
    }

    .primary-badge {
      background: #dbeafe;
      color: #1e40af;
    }

    .delete-btn-small {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      border-radius: 4px;
      font-size: 1rem;
      transition: all .15s ease;
    }

    .delete-btn-small:hover {
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
      max-height: 80vh;
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
      position: relative;
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

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d1d5db;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .search-result-item {
      padding: 0.6rem;
      cursor: pointer;
      font-size: 0.85rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .search-result-item:hover {
      background: #f3f4f6;
    }

    .selected-customer {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal !important;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
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
export class CustomerRelationshipsComponent implements OnInit {
  @Input() customerId!: number;

  relationships: CustomerRelationshipDto[] = [];
  groupedRelationships: { type: string; relationships: CustomerRelationshipDto[] }[] = [];
  loading = false;
  creating = false;
  error = '';
  showCreateDialog = false;

  searchTerm = '';
  searchResults: CustomerSearchResult[] = [];
  selectedCustomer: CustomerSearchResult | null = null;

  newRelationship: CreateCustomerRelationshipDto = {
    relatedCustomerId: 0,
    relationshipType: '',
    isPrimaryContact: false
  };

  RelationshipTypes = RelationshipTypes;

  constructor(
    private relationshipService: CustomerRelationshipService,
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.customerId) {
      this.loadRelationships();
    }
  }

  loadRelationships(): void {
    this.loading = true;
    this.error = '';
    this.relationshipService.getByCustomerId(this.customerId).subscribe({
      next: (relationships) => {
        this.relationships = relationships;
        this.groupRelationships();
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Beziehungen';
        this.loading = false;
      }
    });
  }

  groupRelationships(): void {
    const groups = new Map<string, CustomerRelationshipDto[]>();
    
    this.relationships.forEach(rel => {
      if (!groups.has(rel.relationshipType)) {
        groups.set(rel.relationshipType, []);
      }
      groups.get(rel.relationshipType)!.push(rel);
    });

    this.groupedRelationships = Array.from(groups.entries()).map(([type, rels]) => ({
      type,
      relationships: rels
    }));
  }

  searchCustomers(): void {
    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.api.get<any[]>('/api/customer').subscribe({
      next: (customers) => {
        this.searchResults = customers
          .filter(c => 
            c.id !== this.customerId && // Exclude current customer
            (
              c.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              c.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              c.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
          )
          .slice(0, 10)
          .map(c => ({
            id: c.id,
            firstName: c.firstName,
            name: c.name,
            email: c.email
          }));
      },
      error: () => {
        this.toast.show('Fehler bei der Kundensuche', 'error');
      }
    });
  }

  selectCustomer(customer: CustomerSearchResult): void {
    this.selectedCustomer = customer;
    this.newRelationship.relatedCustomerId = customer.id;
    this.searchResults = [];
    this.searchTerm = '';
  }

  cancelCreate(): void {
    this.showCreateDialog = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedCustomer = null;
    this.newRelationship = {
      relatedCustomerId: 0,
      relationshipType: '',
      isPrimaryContact: false
    };
  }

  confirmCreate(): void {
    if (!this.selectedCustomer || !this.newRelationship.relationshipType) return;

    this.creating = true;
    this.relationshipService.create(this.customerId, this.newRelationship).subscribe({
      next: () => {
        this.toast.show('Beziehung erfolgreich hinzugefügt', 'success');
        this.creating = false;
        this.showCreateDialog = false;
        this.cancelCreate();
        this.loadRelationships();
      },
      error: () => {
        this.toast.show('Fehler beim Hinzufügen der Beziehung', 'error');
        this.creating = false;
      }
    });
  }

  async deleteRelationship(relationship: CustomerRelationshipDto): Promise<void> {
    const relatedName = `${relationship.relatedCustomerFirstName} ${relationship.relatedCustomerLastName}`;
    const ok = await this.confirm.open(
      `Möchten Sie die Beziehung zu "${relatedName}" wirklich entfernen?`,
      'Entfernen',
      'Abbrechen'
    );
    
    if (!ok) return;
    
    this.relationshipService.delete(relationship.id).subscribe({
      next: () => {
        this.toast.show('Beziehung entfernt', 'success');
        this.loadRelationships();
      },
      error: () => {
        this.toast.show('Fehler beim Entfernen der Beziehung', 'error');
      }
    });
  }

  navigateToCustomer(customerId: number): void {
    this.router.navigate(['/customers', customerId]);
  }
}
