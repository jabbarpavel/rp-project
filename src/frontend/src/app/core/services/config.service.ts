import { Injectable } from '@angular/core';

export interface TenantConfig {
  name: string;
  apiUrl: string;
}

export interface TenantsConfig {
  tenants: TenantConfig[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private baseUrl: string = '';
  private initialized: boolean = false;

  constructor() {
    this.initializeBaseUrl();
  }

  private initializeBaseUrl(): void {
    if (this.initialized) {
      return;
    }

    const currentHost = window.location.hostname.toLowerCase();
    const currentPort = window.location.port;
    
    // Determine backend port based on frontend port and hostname
    let backendPort: string;
    
    // Check if we're running locally (localhost, 127.0.0.1, or *.localhost)
    const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.endsWith('.localhost');
    
    if (isLocalhost) {
      // Local development/test environments
      if (currentPort === '4300') {
        // Test environment - Frontend auf 4300, Backend auf 5016
        backendPort = '5016';
      } else {
        // Development environment - Frontend auf 4200, Backend auf 5015
        backendPort = '5015';
      }
      this.baseUrl = `http://localhost:${backendPort}`;
    } else {
      // Production or custom domain
      // For production, the backend is typically behind a reverse proxy on the same domain
      const protocol = window.location.protocol;
      
      // For all production/custom domains, use the same domain
      // The reverse proxy (nginx/traefik) handles routing to the backend
      this.baseUrl = `${protocol}//${currentHost}`;
    }

    this.initialized = true;
    console.log(`✅ ConfigService - Base URL set to: ${this.baseUrl}`);
    console.log(`   Environment detected: ${currentPort === '4300' ? 'Test' : currentPort === '4200' ? 'Development' : 'Production/Custom'}`);
  }

  /**
   * Get the base URL for API calls
   * @returns The base URL (e.g., "http://localhost:5015" or "https://finaro.kynso.ch")
   */
  getBaseUrl(): string {
    if (!this.initialized) {
      this.initializeBaseUrl();
    }
    return this.baseUrl;
  }

  /**
   * Get the current environment based on the frontend port
   * @returns 'Development' | 'Test' | 'Production'
   */
  getEnvironment(): 'Development' | 'Test' | 'Production' {
    const currentPort = window.location.port;
    const currentHost = window.location.hostname.toLowerCase();
    
    const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.endsWith('.localhost');
    
    if (isLocalhost) {
      if (currentPort === '4300') {
        return 'Test';
      }
      return 'Development';
    }
    return 'Production';
  }

  /**
   * Check if running in local environment
   */
  isLocal(): boolean {
    const currentHost = window.location.hostname.toLowerCase();
    return currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.endsWith('.localhost');
  }
}
