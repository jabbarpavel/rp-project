import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CustomerTaskDto {
  id: number;
  title: string;
  status: string;
  dueDate?: string;
  customerId: number;
  customerName?: string;
  assignedToUserId: number;
  assignedToUserName?: string;
  createdAt: string;
}

export interface CreateCustomerTaskDto {
  title: string;
  status: string;
  dueDate?: string;
  customerId: number;
  assignedToUserId: number;
}

export interface UpdateCustomerTaskDto {
  title?: string;
  status?: string;
  dueDate?: string;
  assignedToUserId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private api: ApiService) {}

  getByCustomerId(customerId: number): Observable<CustomerTaskDto[]> {
    return this.api.get<CustomerTaskDto[]>(`/api/tasks/customer/${customerId}`);
  }

  getMyTasks(): Observable<CustomerTaskDto[]> {
    return this.api.get<CustomerTaskDto[]>('/api/tasks/my-tasks');
  }

  getMyOpenTasks(): Observable<CustomerTaskDto[]> {
    return this.api.get<CustomerTaskDto[]>('/api/tasks/my-open-tasks');
  }

  create(task: CreateCustomerTaskDto): Observable<CustomerTaskDto> {
    return this.api.post<CustomerTaskDto>('/api/tasks', task);
  }

  update(id: number, task: UpdateCustomerTaskDto): Observable<CustomerTaskDto> {
    return this.api.put<CustomerTaskDto>(`/api/tasks/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/api/tasks/${id}`);
  }
}
