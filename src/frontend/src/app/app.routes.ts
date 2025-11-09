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
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.page').then(m => m.CustomersPage)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.page').then(m => m.SettingsPage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
