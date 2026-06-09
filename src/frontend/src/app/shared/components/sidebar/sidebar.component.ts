// src/app/core/components/sidebar/sidebar.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { BUILD_INFO } from '../../../core/build-info';

interface SubMenuItem {
  label: string;
  icon?: string;
  // Function so the link can react to the active customer id.
  resolveLink: () => string[] | null;
}

interface MenuItem {
  label: string;
  link: string;
  icon?: string;
  /** Show submenu only when this URL prefix matches the current route. */
  expandWhenStartsWith?: string;
  subMenu?: SubMenuItem[];
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
export class SidebarComponent implements OnInit, OnDestroy {
  /** Customer id currently visible in the URL (e.g. /customers/12 or /customers/12/policies). */
  activeCustomerId: number | null = null;
  /** Cache of the most recently visited customer id, used so the sub-menu link stays useful when navigating away. */
  private lastCustomerId: number | null = null;

  menu: MenuItem[] = [
    { label: 'Dashboard', link: '/dashboard', icon: '🏠' },
    {
      label: 'Kunden',
      link: '/customers',
      icon: '👥',
      expandWhenStartsWith: '/customers',
      subMenu: [
        {
          label: 'Policen',
          icon: '📄',
          resolveLink: () => {
            const id = this.activeCustomerId ?? this.lastCustomerId;
            return id ? ['/customers', String(id), 'policies'] : null;
          }
        }
      ]
    },
    { label: 'Einstellungen', link: '/settings', icon: '⚙️' }
  ];

  logoData: string | null = null;
  tenantName = '';
  buildLabel = '';

  private routerSub?: Subscription;

  constructor(private api: ApiService, private router: Router) {
    const d = new Date(BUILD_INFO.timestamp);
    const date = d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    this.buildLabel = `${BUILD_INFO.branch}@${BUILD_INFO.gitHash}\n${date} ${time}`;
  }

  ngOnInit(): void {
    this.loadTenantLogo();
    this.updateActiveCustomerId(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => this.updateActiveCustomerId((e as NavigationEnd).urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  isMenuExpanded(item: MenuItem): boolean {
    if (!item.subMenu || item.subMenu.length === 0) return false;
    if (!item.expandWhenStartsWith) return true;
    return this.router.url.startsWith(item.expandWhenStartsWith);
  }

  /** True if the submenu entry should be a clickable router link right now. */
  isSubItemEnabled(sub: SubMenuItem): boolean {
    return sub.resolveLink() !== null;
  }

  /** Returns the routerLink array, or null if no customer context is available. */
  subItemLink(sub: SubMenuItem): string[] | null {
    return sub.resolveLink();
  }

  private updateActiveCustomerId(url: string): void {
    // Match /customers/{number}/... or /customers/{number}
    const match = url.match(/^\/customers\/(\d+)(?:\/|$|\?)/);
    if (match) {
      this.activeCustomerId = parseInt(match[1], 10);
      this.lastCustomerId = this.activeCustomerId;
    } else {
      this.activeCustomerId = null;
    }
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
