import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface DocumentDto {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  category?: string;
  customerId: number;
  uploadedByUserId: number;
  uploadedByUserName?: string;
  uploadedByUserEmail?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private api: ApiService) {}

  getByCustomerId(customerId: number): Observable<DocumentDto[]> {
    return this.api.get<DocumentDto[]>(`/api/documents/customer/${customerId}`);
  }

  upload(customerId: number, file: File, category?: string): Observable<DocumentDto> {
    const formData = new FormData();
    formData.append('customerId', customerId.toString());
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    return this.api.upload<DocumentDto>('/api/documents', formData);
  }

  download(documentId: number): Observable<Blob> {
    return this.api.downloadFile(`/api/documents/${documentId}/download`);
  }

  delete(documentId: number): Observable<void> {
    return this.api.delete<void>(`/api/documents/${documentId}`);
  }
}
