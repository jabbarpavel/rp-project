import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getBaseUrl();
    console.log('✅ ApiService - Using base URL:', this.apiUrl);
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

  // Upload file with FormData
  upload<T>(url: string, formData: FormData): Observable<T> {
    const token = localStorage.getItem('jwt_token');
    const tenantId = localStorage.getItem('tenant_id');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (tenantId) headers = headers.set('TenantID', tenantId);
    return this.http.post<T>(`${this.apiUrl}${url}`, formData, { headers });
  }

  // Download file as blob
  downloadFile(url: string): Observable<Blob> {
    const token = localStorage.getItem('jwt_token');
    const tenantId = localStorage.getItem('tenant_id');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (tenantId) headers = headers.set('TenantID', tenantId);
    return this.http.get(`${this.apiUrl}${url}`, { 
      headers, 
      responseType: 'blob' 
    });
  }

  // Advisors abrufen (optional mit Suchbegriff)
  getAdvisors(q?: string) {
    const query = q && q.trim().length > 0 ? `?q=${encodeURIComponent(q.trim())}` : '';
    return this.get<Array<{ id: number; email: string; tenantId: number }>>(`/api/user/advisors${query}`);
  }

  // Advisor für Customer setzen/entfernen
  updateCustomerAdvisor(customerId: number, advisorId: number | null) {
    return this.put(`/api/customer/${customerId}/advisor`, { advisorId });
  }

}
