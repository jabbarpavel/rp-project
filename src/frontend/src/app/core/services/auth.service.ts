// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwt_token';
  private baseUrl: string;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getBaseUrl();
    console.log(`✅ AuthService - Using base URL: ${this.baseUrl}`);
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await lastValueFrom(
        this.http.post<{ token: string; tenantId: number }>(`${this.baseUrl}/user/login`, { email, password })
      );
      if (res?.token) {
        localStorage.setItem(this.tokenKey, res.token);
        if (typeof res.tenantId === 'number') {
          localStorage.setItem('tenant_id', String(res.tenantId));
        } else {
          // Fallback aus JWT
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          if (payload?.tenantId) localStorage.setItem('tenant_id', String(payload.tenantId));
        }
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

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.isTokenExpired(token);
  }
}
