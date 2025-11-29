// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      // ---- Kundenbereiche in richtiger Reihenfolge ----
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.page').then(m => m.CustomersPage)
      },
      {
        path: 'customers/createCustomer',
        loadComponent: () =>
          import('./features/customers/createCustomer.page').then(m => m.CreateCustomerPage)
      },
      {
        path: 'customers/editCustomer/:id',
        loadComponent: () =>
          import('./features/customers/editCustomer.page').then(m => m.EditCustomerPage)
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customerDetail.page').then(m => m.CustomerDetailPage)
      },
      // -------------Settings------------------------------------
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.page').then(m => m.SettingsOverviewPage),
      },
      {
        path: 'settings/profile',
        loadComponent: () =>
          import('./features/settings/profile.page').then(m => m.ProfilePage),
      },
      {
        path: 'settings/company',
        loadComponent: () =>
          import('./features/settings/company.page').then(m => m.CompanySettingsPage),
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
