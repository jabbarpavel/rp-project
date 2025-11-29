import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

interface TenantInfo {
  id: number;
  name: string;
  domain: string;
  logoData?: string | null;
}

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <button class="back-btn" (click)="goBack()">← Zurück</button>
      <h2>Firmeneinstellungen</h2>

      <div *ngIf="!isAdmin" class="access-denied">
        <p>Sie haben keine Berechtigung, diese Seite anzuzeigen.</p>
        <p>Nur Administratoren können Firmeneinstellungen ändern.</p>
      </div>

      <div *ngIf="isAdmin && loading" class="loading">
        Laden...
      </div>

      <div *ngIf="isAdmin && !loading" class="content">
        <div class="card">
          <h3>Firmen Logo</h3>
          <p class="hint">Das Logo wird oben links in der Sidebar angezeigt.</p>

          <div class="logo-preview">
            <img *ngIf="logoData" [src]="logoData" alt="Firmen Logo" class="logo-img" />
            <div *ngIf="!logoData" class="logo-placeholder">
              Kein Logo vorhanden
            </div>
          </div>

          <div class="actions">
            <button 
              class="btn btn-primary" 
              (click)="triggerFileInput()"
              [disabled]="uploading"
            >
              {{ logoData ? 'Logo ändern' : 'Logo hinzufügen' }}
            </button>
            <button 
              *ngIf="logoData" 
              class="btn btn-danger" 
              (click)="removeLogo()"
              [disabled]="uploading"
            >
              Logo entfernen
            </button>
          </div>

          <p *ngIf="uploading" class="uploading-text">Hochladen...</p>

          <input 
            type="file" 
            #fileInput 
            (change)="onFileSelected($event)" 
            accept="image/*"
            style="display: none;"
          />

          <p class="file-hint">Unterstützte Formate: PNG, JPG, GIF. Max. 2MB.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 600px; }
    .back-btn {
      background: none; border: none; color: #0f70ff;
      cursor: pointer; font-size: 0.95rem; margin-bottom: 1rem;
      padding: 0;
    }
    .back-btn:hover { text-decoration: underline; }
    h2 { font-size: 1.6rem; margin: 0 0 1.5rem; }
    .access-denied {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 1.5rem; color: #991b1b;
    }
    .loading { color: #6b7280; font-size: 0.95rem; }
    .card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }
    .card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .hint { color: #6b7280; font-size: 0.9rem; margin: 0 0 1rem; }
    .logo-preview {
      background: #f3f4f6; border-radius: 8px;
      padding: 1.5rem; margin-bottom: 1rem;
      display: flex; align-items: center; justify-content: center;
      min-height: 100px;
    }
    .logo-img { max-width: 200px; max-height: 80px; object-fit: contain; }
    .logo-placeholder { color: #9ca3af; font-size: 0.9rem; }
    .actions { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem;
      cursor: pointer; border: none; transition: opacity 0.2s;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #0f70ff; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #0d5ed9; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .uploading-text { color: #6b7280; font-size: 0.85rem; font-style: italic; margin: 0; }
    .file-hint { color: #9ca3af; font-size: 0.8rem; margin: 0.75rem 0 0; }
  `]
})
export class CompanySettingsPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isAdmin = false;
  loading = true;
  uploading = false;
  tenantId: number | null = null;
  logoData: string | null = null;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    if (this.isAdmin) {
      this.loadTenantInfo();
    } else {
      this.loading = false;
    }
  }

  loadTenantInfo(): void {
    const tenantIdStr = localStorage.getItem('tenant_id');
    if (!tenantIdStr) {
      this.loading = false;
      return;
    }

    this.tenantId = parseInt(tenantIdStr, 10);

    this.api.get<TenantInfo>(`/api/tenant/${this.tenantId}`).subscribe({
      next: (tenant) => {
        this.logoData = tenant.logoData || null;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Fehler beim Laden der Firmendaten', 'error');
        this.loading = false;
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.show('Bitte wählen Sie eine Bilddatei aus', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.toast.show('Das Bild darf maximal 2MB gross sein', 'error');
      return;
    }

    this.uploading = true;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      this.uploadLogo(base64Data);
    };
    reader.onerror = () => {
      this.toast.show('Fehler beim Lesen der Datei', 'error');
      this.uploading = false;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    input.value = '';
  }

  private uploadLogo(logoData: string): void {
    if (!this.tenantId) {
      this.toast.show('Tenant nicht gefunden', 'error');
      this.uploading = false;
      return;
    }

    this.api.put<TenantInfo>(`/api/tenant/${this.tenantId}/logo`, { logoData }).subscribe({
      next: (tenant) => {
        this.logoData = tenant.logoData || null;
        this.toast.show('Logo erfolgreich hochgeladen', 'success');
        this.uploading = false;
      },
      error: () => {
        this.toast.show('Fehler beim Hochladen des Logos', 'error');
        this.uploading = false;
      }
    });
  }

  removeLogo(): void {
    if (!this.tenantId) return;

    this.uploading = true;

    this.api.put<TenantInfo>(`/api/tenant/${this.tenantId}/logo`, { logoData: null }).subscribe({
      next: () => {
        this.logoData = null;
        this.toast.show('Logo entfernt', 'success');
        this.uploading = false;
      },
      error: () => {
        this.toast.show('Fehler beim Entfernen des Logos', 'error');
        this.uploading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
