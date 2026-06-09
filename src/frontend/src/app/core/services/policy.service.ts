import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export enum PolicyStatus {
  Active = 0,
  Suspended = 1,
  Terminated = 2,
  Expired = 3
}

export interface PolicyDto {
  id: number;
  customerId: number;
  policyNumber: string;
  type: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  organizationalUnit?: string | null;
  advisorUserId?: number | null;
  advisorName?: string | null;
  status: PolicyStatus;
  statusLabel: string;
  documentFileName?: string | null;
  documentContentType?: string | null;
  documentFileSize?: number | null;
  hasDocument: boolean;
  createdByUserId: number;
  createdByUserName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePolicyForm {
  policyNumber: string;
  type: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  organizationalUnit?: string | null;
  advisorUserId?: number | null;
  status: PolicyStatus;
  file: File;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.apiUrl = this.config.getBaseUrl();
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    const tenantId = localStorage.getItem('tenant_id');
    let h = new HttpHeaders();
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    if (tenantId) h = h.set('TenantID', tenantId);
    return h;
  }

  list(customerId: number): Observable<PolicyDto[]> {
    return this.http.get<PolicyDto[]>(
      `${this.apiUrl}/api/customer/${customerId}/policies`,
      { headers: this.authHeaders() }
    );
  }

  create(customerId: number, form: CreatePolicyForm): Observable<PolicyDto> {
    const fd = new FormData();
    fd.append('policyNumber', form.policyNumber);
    fd.append('type', form.type);
    fd.append('company', form.company);
    fd.append('startDate', form.startDate);
    if (form.endDate) fd.append('endDate', form.endDate);
    if (form.organizationalUnit) fd.append('organizationalUnit', form.organizationalUnit);
    if (form.advisorUserId !== null && form.advisorUserId !== undefined) {
      fd.append('advisorUserId', String(form.advisorUserId));
    }
    fd.append('status', String(form.status));
    fd.append('file', form.file);
    return this.http.post<PolicyDto>(
      `${this.apiUrl}/api/customer/${customerId}/policies`,
      fd,
      { headers: this.authHeaders() }
    );
  }

  delete(customerId: number, policyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/customer/${customerId}/policies/${policyId}`,
      { headers: this.authHeaders() }
    );
  }

  /** Builds a URL the user can navigate to in order to download the policy document. */
  downloadUrl(customerId: number, policyId: number): string {
    return `${this.apiUrl}/api/customer/${customerId}/policies/${policyId}/document`;
  }

  /** Downloads via blob so the auth header is sent. Triggers browser download. */
  downloadDocument(customerId: number, policyId: number, fileName: string): void {
    this.http
      .get(this.downloadUrl(customerId, policyId), {
        headers: this.authHeaders(),
        responseType: 'blob'
      })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  }
}
