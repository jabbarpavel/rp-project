// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import tenants from '../../../environments/tenants.json';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl: string;

  constructor() {
    const currentHost = window.location.hostname.toLowerCase();

    // einfach: Domain direkt aus apiUrl extrahieren und vergleichen
    const tenant = tenants.tenants.find(t => {
      const domain = new URL(t.apiUrl).hostname.toLowerCase();
      return currentHost.includes(domain);
    });

    this.baseUrl = tenant ? tenant.apiUrl : 'http://localhost:5020';
    console.log(`✅ API baseUrl set to: ${this.baseUrl}`);
  }


  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.auth.getToken();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const tenantId = this.auth.getTenantId();
    if (tenantId) headers = headers.set('TenantID', tenantId.toString());

    return headers;
  }

  async get<T>(url: string): Promise<T> {
    return await lastValueFrom(this.http.get<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() }));
  }

  async post<T>(url: string, body: any): Promise<T> {
    return await lastValueFrom(this.http.post<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders() }));
  }

  async put<T>(url: string, body: any): Promise<T> {
    return await lastValueFrom(this.http.put<T>(`${this.baseUrl}${url}`, body, { headers: this.getHeaders() }));
  }

  async delete<T>(url: string): Promise<T> {
    return await lastValueFrom(this.http.delete<T>(`${this.baseUrl}${url}`, { headers: this.getHeaders() }));
  }
}
