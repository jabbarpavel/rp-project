import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService, DocumentDto } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-customer-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card documents-card">
      <div class="card-header">
        <h2>Dokumente</h2>
        <label class="upload-btn" [class.disabled]="uploading">
          <input 
            type="file" 
            (change)="onFileSelected($event)" 
            [disabled]="uploading"
            hidden
          />
          <span>{{ uploading ? 'Wird hochgeladen...' : '+ Hochladen' }}</span>
        </label>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Dokumente...</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && documents.length === 0" class="empty-state">
        <p>Keine Dokumente vorhanden.</p>
      </div>

      <div *ngIf="!loading && !error && documents.length > 0" class="documents-list">
        <div *ngFor="let doc of documents" class="document-item">
          <div class="document-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="document-info">
            <div class="document-name">{{ doc.fileName }}</div>
            <div class="document-meta">
              <span>{{ formatFileSize(doc.fileSize) }}</span>
              <span>•</span>
              <span>{{ formatDate(doc.createdAt) }}</span>
              <span *ngIf="doc.uploadedByUserName">•</span>
              <span *ngIf="doc.uploadedByUserName">{{ doc.uploadedByUserName }}</span>
            </div>
          </div>
          <div class="document-actions">
            <button class="icon-btn" (click)="downloadDocument(doc)" title="Herunterladen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button class="icon-btn danger" (click)="deleteDocument(doc)" title="Löschen" *ngIf="canDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .documents-card {
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

    .upload-btn {
      display: inline-flex;
      align-items: center;
      padding: .4rem 1rem;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color .15s ease;
    }

    .upload-btn:hover:not(.disabled) {
      background: #1d4ed8;
    }

    .upload-btn.disabled {
      background: #9ca3af;
      cursor: not-allowed;
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

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: background-color .15s ease;
    }

    .document-item:hover {
      background-color: #f9fafb;
    }

    .document-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #f3f4f6;
      border-radius: 8px;
      color: #6b7280;
      flex-shrink: 0;
    }

    .document-info {
      flex: 1;
      min-width: 0;
    }

    .document-name {
      font-size: .9rem;
      font-weight: 600;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .document-meta {
      display: flex;
      align-items: center;
      gap: .4rem;
      margin-top: .2rem;
      font-size: .8rem;
      color: #6b7280;
    }

    .document-actions {
      display: flex;
      gap: .3rem;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
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
  `]
})
export class CustomerDocumentsComponent implements OnInit {
  @Input() customerId!: number;

  documents: DocumentDto[] = [];
  loading = false;
  uploading = false;
  error = '';
  canDelete = false;

  constructor(
    private documentService: DocumentService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canDelete = this.permissionService.canDeleteDocuments();
    if (this.customerId) {
      this.loadDocuments();
    }
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = '';
    this.documentService.getByCustomerId(this.customerId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Dokumente';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.toast.show('Datei ist zu groß (max. 10 MB)', 'error');
      return;
    }

    this.uploading = true;
    this.documentService.upload(this.customerId, file).subscribe({
      next: () => {
        this.toast.show('Dokument erfolgreich hochgeladen', 'success');
        this.uploading = false;
        this.loadDocuments();
        input.value = ''; // Reset input
      },
      error: () => {
        this.toast.show('Fehler beim Hochladen des Dokuments', 'error');
        this.uploading = false;
        input.value = ''; // Reset input
      }
    });
  }

  downloadDocument(doc: DocumentDto): void {
    this.documentService.download(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.toast.show('Dokument wird heruntergeladen', 'success');
      },
      error: () => {
        this.toast.show('Fehler beim Herunterladen des Dokuments', 'error');
      }
    });
  }

  async deleteDocument(doc: DocumentDto): Promise<void> {
    const ok = await this.confirm.open(
      `Dokument "${doc.fileName}" wirklich löschen?`,
      'Löschen',
      'Abbrechen'
    );
    if (!ok) return;

    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.toast.show('Dokument gelöscht', 'success');
        this.loadDocuments();
      },
      error: () => {
        this.toast.show('Fehler beim Löschen des Dokuments', 'error');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
