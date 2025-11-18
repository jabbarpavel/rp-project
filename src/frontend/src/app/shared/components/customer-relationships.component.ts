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
    <div class="card-header">
      <h2>Beziehungen</h2>
    </div>
    
    <div *ngIf="loading" class="state-msg">Lade Beziehungen...</div>
    <div *ngIf="error" class="state-msg error">{{ error }}</div>

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

    <dl class="detail-list" *ngIf="!loading && !error">
      <!-- Show add button at the top -->
      <div class="add-relationship-row">
        <button class="link-btn" (click)="showCreateDialog = true">+ Beziehung hinzufügen</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="relationships.length === 0" class="empty-row">
        <span class="empty-text">Keine Beziehungen vorhanden</span>
      </div>

      <!-- Show relationships grouped by type -->
      <ng-container *ngFor="let group of groupedRelationships">
        <div class="relationship-type-row">
          <dt class="relationship-type-label">{{ group.type }}</dt>
          <dd class="relationship-list">
            <div *ngFor="let rel of group.relationships; let last = last" class="relationship-entry">
              <span 
                class="customer-link" 
                (click)="navigateToCustomer(rel.relatedCustomerId)"
                title="Zu diesem Kunden navigieren"
              >
                {{ rel.relatedCustomerFirstName }} {{ rel.relatedCustomerLastName }}
              </span>
              <span *ngIf="rel.isPrimaryContact" class="primary-badge">Hauptansprechperson</span>
              <button class="delete-btn-inline" (click)="deleteRelationship(rel)" title="Entfernen">
                ✕
              </button>
              <span *ngIf="!last" class="separator">•</span>
            </div>
          </dd>
        </div>
      </ng-container>
    </dl>
  `,
  styles: [`
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

    .add-relationship-row {
      padding: .5rem 0;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: flex-end;
    }

    .link-btn {
      border: none;
      background: none;
      padding: 0;
      font-size: .85rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
      transition: color .15s ease;
    }

    .link-btn:hover {
      text-decoration: underline;
      color: #1d4ed8;
    }

    .empty-row {
      padding: 1.5rem 0;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }

    .empty-text {
      color: #9ca3af;
      font-size: .9rem;
      font-style: italic;
    }

    .relationship-type-row {
      display: grid;
      grid-template-columns: 160px minmax(0, 1fr);
      padding: .5rem 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: .9rem;
      align-items: start;
    }

    .relationship-type-row:last-child {
      border-bottom: none;
    }

    .relationship-type-label {
      margin: 0;
      font-weight: 600;
      color: #4b5563;
      padding-top: .1rem;
    }

    .relationship-list {
      margin: 0;
      color: #111827;
      display: flex;
      flex-direction: column;
      gap: .4rem;
    }

    .relationship-entry {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }

    .customer-link {
      color: #2563eb;
      cursor: pointer;
      transition: color .15s ease;
      font-weight: 500;
    }

    .customer-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .primary-badge {
      display: inline-flex;
      align-items: center;
      padding: .15rem .5rem;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 600;
      background: #dbeafe;
      color: #1e40af;
      gap: .2rem;
    }

    .delete-btn-inline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 3px;
      font-size: .85rem;
      transition: all .15s ease;
    }

    .delete-btn-inline:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .separator {
      color: #d1d5db;
      margin: 0 .3rem;
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
