// src/app/core/components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

interface MenuItem {
  label: string;
  link: string;
  icon?: string;
}

interface TenantInfo {
  id: number;
  name: string;
  domain: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menu: MenuItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: '🏠' },
    { label: 'Kunden', link: '/customers', icon: '👥' },
    { label: 'Einstellungen', link: '/settings', icon: '⚙️' }
  ];

  logoUrl: string | null = null;
  logoError = false;
  tenantName = '';
  expectedLogoFilename = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTenantLogo();
  }

  loadTenantLogo(): void {
    const tenantId = localStorage.getItem('tenant_id');
    if (!tenantId) {
      console.warn('Sidebar: No tenant_id found in localStorage');
      this.logoError = true;
      return;
    }

    this.api.get<TenantInfo>(`/api/tenant/${tenantId}`).subscribe({
      next: (tenant) => {
        this.tenantName = tenant.name;
        // Try to load logo based on tenant domain
        // Logo files should be named: {domain}.png (e.g., finaro.png)
        const domain = tenant.domain?.toLowerCase() || tenant.name?.toLowerCase().replace(/\s+/g, '_');
        this.expectedLogoFilename = `${domain}.png`;
        this.logoUrl = `assets/logos/${domain}.png`;
        console.log(`Sidebar: Loading logo for tenant "${tenant.name}" (domain: "${tenant.domain}")`);
        console.log(`Sidebar: Expected logo file: assets/logos/${domain}.png`);
      },
      error: (err) => {
        console.error('Sidebar: Failed to load tenant info', err);
        this.logoError = true;
      }
    });
  }

  onLogoError(): void {
    console.warn(`Sidebar: Logo file not found. Expected: assets/logos/${this.expectedLogoFilename}`);
    console.warn('Sidebar: Make sure to place your logo file in src/frontend/src/assets/logos/ with the filename matching your tenant domain.');
    this.logoError = true;
    this.logoUrl = null;
  }
}
