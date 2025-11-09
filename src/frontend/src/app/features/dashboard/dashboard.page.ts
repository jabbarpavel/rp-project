// src/app/features/dashboard/dashboard.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Willkommen im Dashboard</h2>
      <p>Du bist erfolgreich im CRM-System angemeldet.</p>
    </div>
  `,
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {}
