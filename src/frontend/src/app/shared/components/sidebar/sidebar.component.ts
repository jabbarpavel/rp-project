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
  menu: MenuItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: '🏠' },
    { label: 'Kunden', link: '/customers', icon: '👥' },
    { label: 'Einstellungen', link: '/settings', icon: '⚙️' }
  ];

  logoData: string | null = null;
  tenantName = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTenantLogo();
  }

  loadTenantLogo(): void {
    const tenantIdStr = localStorage.getItem('tenant_id');
    if (!tenantIdStr) {
      console.warn('Sidebar: No tenant_id found in localStorage');
      return;
    }

    const tenantId = parseInt(tenantIdStr, 10);

    this.api.get<TenantInfo>(`/api/tenant/${tenantId}`).subscribe({
      next: (tenant) => {
        this.tenantName = tenant.name;
        this.logoData = tenant.logoData || null;
      },
      error: (err) => {
        console.error('Sidebar: Failed to load tenant info', err);
      }
    });
  }
}
