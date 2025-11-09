// src/app/features/customers/customers.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

interface Customer {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  tenantId?: number;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss']
})
export class CustomersPage implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    this.loading = true;
    this.error = '';
    try {
      const data = await this.api.get<Customer[]>('/api/customer');
      this.customers = data;
    } catch {
      this.error = 'Kunden konnten nicht geladen werden.';
    } finally {
      this.loading = false;
    }
  }
}
