// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import tenants from '../../../environments/tenants.json';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwt_token';
  private baseUrl: string;

  constructor(private http: HttpClient, private router: Router) {
    const currentHost = window.location.hostname.toLowerCase();

    // domain aus apiUrl extrahieren und mit aktuellem Host vergleichen
    const tenant = tenants.tenants.find(t => {
      const domain = new URL(t.apiUrl).hostname.toLowerCase();
      return currentHost.includes(domain);
    });

    this.baseUrl = tenant ? tenant.apiUrl : 'http://localhost:5020';
    console.log(`✅ Auth baseUrl set to: ${this.baseUrl}`);
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await lastValueFrom(
        this.http.post<{ token: string }>(`${this.baseUrl}/api/user/login`, { email, password })
      );
      if (res && res.token) {
        localStorage.setItem(this.tokenKey, res.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getTenantId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tenantId ?? null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.isTokenExpired(token);
  }
}
