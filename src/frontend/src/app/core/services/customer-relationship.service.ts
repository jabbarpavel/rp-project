import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CustomerRelationshipDto {
  id: number;
  customerId: number;
  customerFirstName?: string;
  customerLastName?: string;
  relatedCustomerId: number;
  relatedCustomerFirstName?: string;
  relatedCustomerLastName?: string;
  relationshipType: string;
  isPrimaryContact: boolean;
  createdAt: string;
}

export interface CreateCustomerRelationshipDto {
  relatedCustomerId: number;
  relationshipType: string;
  isPrimaryContact: boolean;
}

export const RelationshipTypes = {
  Spouse: 'Ehepartner',
  Parent: 'Eltern',
  Child: 'Kind',
  Sibling: 'Geschwister',
  SameHousehold: 'GleicherHaushalt',
  OrganisationMember: 'MitgliedEinerOrganisation'
};

@Injectable({
  providedIn: 'root'
})
export class CustomerRelationshipService {
  constructor(private api: ApiService) {}

  getByCustomerId(customerId: number): Observable<CustomerRelationshipDto[]> {
    return this.api.get<CustomerRelationshipDto[]>(`/api/customer/${customerId}/relationships`);
  }

  create(customerId: number, dto: CreateCustomerRelationshipDto): Observable<CustomerRelationshipDto> {
    return this.api.post<CustomerRelationshipDto>(`/api/customer/${customerId}/relationships`, dto);
  }

  delete(relationshipId: number): Observable<void> {
    return this.api.delete<void>(`/api/customer/relationships/${relationshipId}`);
  }

  isPrimaryContact(customerId: number): Observable<{ isPrimaryContact: boolean }> {
    return this.api.get<{ isPrimaryContact: boolean }>(`/api/customer/${customerId}/is-primary-contact`);
  }
}
