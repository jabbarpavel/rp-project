import { Injectable } from '@angular/core';

export enum Permission {
  None = 0,
  ViewCustomers = 1,
  CreateCustomers = 2,
  EditCustomers = 4,
  DeleteCustomers = 8,
  ViewDocuments = 16,
  UploadDocuments = 32,
  DeleteDocuments = 64,
  ViewUsers = 128,
  CreateUsers = 256,
  EditUsers = 512,
  DeleteUsers = 1024,
  ManagePermissions = 2048
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userPermissions: number = 0;

  constructor() {
    this.loadPermissions();
  }

  private loadPermissions(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // The permissions should be in the JWT token
        this.userPermissions = payload.permissions || 0;
      } catch {
        this.userPermissions = 0;
      }
    }
  }

  hasPermission(permission: Permission): boolean {
    return (this.userPermissions & permission) === permission;
  }

  canDeleteCustomers(): boolean {
    return this.hasPermission(Permission.DeleteCustomers);
  }

  canDeleteDocuments(): boolean {
    return this.hasPermission(Permission.DeleteDocuments);
  }

  canEditCustomers(): boolean {
    return this.hasPermission(Permission.EditCustomers);
  }

  refreshPermissions(): void {
    this.loadPermissions();
  }
}
