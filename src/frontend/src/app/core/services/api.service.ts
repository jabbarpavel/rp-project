import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import tenantsConfig from '../../../environments/tenants.json';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '';

  constructor(private http: HttpClient) {
    this.initializeApiUrl();
  }

  private initializeApiUrl(): void {
    const hostname = window.location.hostname.toLowerCase();
    const tenants = tenantsConfig.tenants;

    const tenant = tenants.find((t: any) =>
      hostname.includes(t.name.toLowerCase())
    );

    if (tenant) {
      this.apiUrl = tenant.apiUrl;
      console.log('✅ API base URL gesetzt:', this.apiUrl);
    } else {
      console.error('❌ Kein passender Tenant für Host:', hostname);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    const tenantId = localStorage.getItem('tenant_id');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (tenantId) headers = headers.set('TenantID', tenantId);
    return headers;
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${url}`, { headers: this.getHeaders() });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${url}`, body, { headers: this.getHeaders() });
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${url}`, body, { headers: this.getHeaders() });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${url}`, { headers: this.getHeaders() });
  }
}
