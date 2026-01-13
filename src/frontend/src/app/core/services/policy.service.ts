import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export enum PolicyType {
  Haushalt = 0,
  Krankenkasse = 1,
  Motorfahrzeugversicherung = 2,
  Rechtsschutz = 3
}

export enum PaymentFrequency {
  None = 0,
  Monatlich = 1,
  ZweiMonatlich = 2,
  Vierteljahrlich = 3,
  Halbjahrlich = 4,
  Jahrlich = 5,
  Einmaleinlage = 6
}

export enum MutationReason {
  Unbekannt = 0,
  Neugeschaft = 1,
  Mutation = 2,
  Bestandsubernahme = 3,
  Ersatz = 4
}

export interface PolicyDto {
  id: number;
  policyNumber: string;
  type: PolicyType;
  typeDisplay: string;
  company: string;
  organizationalUnit: string;
  productName?: string;
  mutationReason?: MutationReason;
  mutationReasonDisplay?: string;
  customerNumber?: string;
  startDate?: string;
  endDate?: string;
  paymentFrequency?: PaymentFrequency;
  paymentFrequencyDisplay?: string;
  annualPremium?: number;
  advisor?: string;
  status?: string;
  documentId?: number;
  documentFileName?: string;
  customerId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePolicyDto {
  policyNumber: string;
  type: PolicyType;
  company: string;
  organizationalUnit: string;
  productName?: string;
  mutationReason?: MutationReason;
  customerNumber?: string;
  startDate?: string;
  endDate?: string;
  paymentFrequency?: PaymentFrequency;
  annualPremium?: number;
  advisor?: string;
  status?: string;
  documentId?: number;
  customerId: number;
}

export interface UpdatePolicyDto {
  policyNumber: string;
  type: PolicyType;
  company: string;
  organizationalUnit: string;
  productName?: string;
  mutationReason?: MutationReason;
  customerNumber?: string;
  startDate?: string;
  endDate?: string;
  paymentFrequency?: PaymentFrequency;
  annualPremium?: number;
  advisor?: string;
  status?: string;
  documentId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  constructor(private api: ApiService) {}

  getById(id: number): Observable<PolicyDto> {
    return this.api.get<PolicyDto>(`/api/policies/${id}`);
  }

  getByCustomerId(customerId: number): Observable<PolicyDto[]> {
    return this.api.get<PolicyDto[]>(`/api/policies/customer/${customerId}`);
  }

  create(policy: CreatePolicyDto): Observable<PolicyDto> {
    return this.api.post<PolicyDto>('/api/policies', policy);
  }

  update(id: number, policy: UpdatePolicyDto): Observable<PolicyDto> {
    return this.api.put<PolicyDto>(`/api/policies/${id}`, policy);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/api/policies/${id}`);
  }
}
