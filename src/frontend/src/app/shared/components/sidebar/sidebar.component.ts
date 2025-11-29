// src/app/core/components/sidebar/sidebar.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

interface MenuItem {
  label: string;
  link: string;
  icon?: string;
}

interface TenantInfo {
  id: number;
  name: string;
  domain: string;
  logoData?: string | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  menu: MenuItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: '🏠' },
    { label: 'Kunden', link: '/customers', icon: '👥' },
    { label: 'Einstellungen', link: '/settings', icon: '⚙️' }
  ];

  logoData: string | null = null;
  tenantId: number | null = null;
  tenantName = '';
  uploading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTenantLogo();
  }

  loadTenantLogo(): void {
    const tenantIdStr = localStorage.getItem('tenant_id');
    if (!tenantIdStr) {
      console.warn('Sidebar: No tenant_id found in localStorage');
      return;
    }

    this.tenantId = parseInt(tenantIdStr, 10);

    this.api.get<TenantInfo>(`/api/tenant/${this.tenantId}`).subscribe({
      next: (tenant) => {
        this.tenantName = tenant.name;
        this.logoData = tenant.logoData || null;
        console.log(`Sidebar: Loaded tenant "${tenant.name}"${tenant.logoData ? ' with logo' : ' without logo'}`);
      },
      error: (err) => {
        console.error('Sidebar: Failed to load tenant info', err);
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
      error: (err) => {
        console.error('Failed to upload logo', err);
        this.toast.show('Fehler beim Hochladen des Logos', 'error');
        this.uploading = false;
      }
    });
  }
}
