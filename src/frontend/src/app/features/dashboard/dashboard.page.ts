import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface DashboardStats {
  customerCount: number;
  openTasksCount: number;
  openTasks: Array<{
    id: number;
    title: string;
    status: string;
    dueDate?: string;
    customerId: number;
    customerName?: string;
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subline">Übersicht über Ihre Kunden und Aufgaben</p>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Dashboard...</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && stats" class="dashboard-grid">
        <!-- Customer Count Card -->
        <div class="stat-card">
          <div class="stat-icon customers">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.customerCount }}</div>
            <div class="stat-label">Meine Kunden</div>
          </div>
        </div>

        <!-- Open Tasks Card -->
        <div class="stat-card">
          <div class="stat-icon tasks">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.openTasksCount }}</div>
            <div class="stat-label">Offene Aufgaben</div>
          </div>
        </div>
      </div>

      <!-- Open Tasks List -->
      <div *ngIf="!loading && !error && stats && stats.openTasks.length > 0" class="tasks-section">
        <h2>Offene Aufgaben</h2>
        <div class="tasks-list">
          <div *ngFor="let task of stats.openTasks" class="task-item" [routerLink]="['/customers', task.customerId]">
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span *ngIf="task.customerName">Kunde: {{ task.customerName }}</span>
                <span *ngIf="task.dueDate">•</span>
                <span *ngIf="task.dueDate" [class.overdue]="isOverdue(task.dueDate)">
                  Fällig: {{ formatDate(task.dueDate) }}
                </span>
              </div>
            </div>
            <div class="task-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && stats && stats.openTasks.length === 0" class="empty-state">
        <p>🎉 Keine offenen Aufgaben vorhanden!</p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #111827;
    }

    .subline {
      margin: 0.5rem 0 0 0;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .state-msg {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .state-msg.error {
      color: #dc2626;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.customers {
      background: #dbeafe;
      color: #1e40af;
    }

    .stat-icon.tasks {
      background: #d1fae5;
      color: #065f46;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
    }

    .tasks-section {
      margin-top: 2rem;
    }

    .tasks-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #111827;
    }

    .tasks-list {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      overflow: hidden;
    }

    .task-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-item:hover {
      background: #f9fafb;
    }

    .task-info {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: #111827;
      margin-bottom: 0.3rem;
    }

    .task-meta {
      font-size: 0.85rem;
      color: #6b7280;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .task-meta .overdue {
      color: #dc2626;
      font-weight: 500;
    }

    .task-arrow {
      color: #9ca3af;
      flex-shrink: 0;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
      color: #6b7280;
    }
  `]
})
export class DashboardPage implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';
    this.api.get<DashboardStats>('/api/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Dashboard-Daten';
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  isOverdue(dateStr: string): boolean {
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
}
