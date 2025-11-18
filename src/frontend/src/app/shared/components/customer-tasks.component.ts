import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, CustomerTaskDto, CreateCustomerTaskDto } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-customer-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card tasks-card">
      <div class="card-header">
        <h2>Aufgaben</h2>
        <button class="add-btn" (click)="showCreateDialog = true">
          + Neue Aufgabe
        </button>
      </div>

      <!-- Create Task Dialog -->
      <div class="modal" *ngIf="showCreateDialog" (click)="showCreateDialog = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Neue Aufgabe erstellen</h3>
          <div class="form-group">
            <label>Titel *</label>
            <input 
              type="text" 
              [(ngModel)]="newTask.title" 
              class="form-control" 
              placeholder="Aufgabenbeschreibung"
            />
          </div>
          <div class="form-group">
            <label>Zugewiesen an *</label>
            <select [(ngModel)]="newTask.assignedToUserId" class="form-control">
              <option [value]="0" disabled>Benutzer auswählen</option>
              <option *ngFor="let user of users" [value]="user.id">{{ user.email }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="newTask.status" class="form-control">
              <option value="offen">Offen</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fälligkeit</label>
            <input 
              type="date" 
              [(ngModel)]="newTask.dueDateStr" 
              class="form-control"
            />
          </div>
          <div class="modal-actions">
            <button class="btn secondary" (click)="cancelCreate()">Abbrechen</button>
            <button class="btn primary" (click)="confirmCreate()" [disabled]="!newTask.title || !newTask.assignedToUserId || creating">
              {{ creating ? 'Erstellen...' : 'Erstellen' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Task Dialog -->
      <div class="modal" *ngIf="showEditDialog" (click)="showEditDialog = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Aufgabe bearbeiten</h3>
          <div class="form-group">
            <label>Titel *</label>
            <input 
              type="text" 
              [(ngModel)]="editTask.title" 
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="editTask.status" class="form-control">
              <option value="offen">Offen</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fälligkeit</label>
            <input 
              type="date" 
              [(ngModel)]="editTask.dueDateStr" 
              class="form-control"
            />
          </div>
          <div class="modal-actions">
            <button class="btn secondary" (click)="cancelEdit()">Abbrechen</button>
            <button class="btn primary" (click)="confirmEdit()" [disabled]="!editTask.title || updating">
              {{ updating ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="state-msg">Lade Aufgaben...</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div *ngIf="!loading && !error && tasks.length === 0" class="empty-state">
        <p>Keine Aufgaben vorhanden.</p>
      </div>

      <div *ngIf="!loading && !error && tasks.length > 0" class="tasks-list">
        <div *ngFor="let task of tasks" class="task-item" [class.completed]="task.status === 'erledigt'">
          <div class="task-status">
            <span class="status-badge" [class.open]="task.status === 'offen'" [class.done]="task.status === 'erledigt'">
              {{ task.status }}
            </span>
          </div>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-meta">
              <span *ngIf="task.dueDate">Fällig: {{ formatDate(task.dueDate) }}</span>
              <span *ngIf="task.assignedToUserName">•</span>
              <span *ngIf="task.assignedToUserName">{{ task.assignedToUserName }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-btn" (click)="startEdit(task)" title="Bearbeiten">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn danger" (click)="deleteTask(task)" title="Löschen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .tasks-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.1rem 1.25rem;
      margin-top: 1rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .9rem;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #111827;
    }

    .add-btn {
      display: inline-flex;
      align-items: center;
      padding: .4rem 1rem;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      font-size: .85rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background .15s ease;
    }

    .add-btn:hover {
      background: #1d4ed8;
    }

    .state-msg {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
      font-size: .9rem;
    }

    .state-msg.error {
      color: #dc2626;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
    }

    .empty-state p {
      margin: 0;
      font-size: .9rem;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: .6rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      padding: .8rem;
      background: #f9fafb;
      border-radius: 8px;
      gap: .8rem;
      transition: background .15s ease;
    }

    .task-item:hover {
      background: #f3f4f6;
    }

    .task-item.completed {
      opacity: 0.7;
    }

    .task-status {
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-block;
      padding: .25rem .6rem;
      border-radius: 4px;
      font-size: .75rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.open {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.done {
      background: #d1fae5;
      color: #065f46;
    }

    .task-info {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-size: .9rem;
      font-weight: 500;
      color: #111827;
      margin-bottom: .2rem;
    }

    .task-item.completed .task-title {
      text-decoration: line-through;
    }

    .task-meta {
      font-size: .8rem;
      color: #6b7280;
      display: flex;
      gap: .4rem;
      align-items: center;
    }

    .task-actions {
      display: flex;
      gap: .3rem;
      flex-shrink: 0;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: #6b7280;
      cursor: pointer;
      transition: all .15s ease;
    }

    .icon-btn:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .icon-btn.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 500px;
      width: 90%;
    }

    .modal-content h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #111827;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: Arial, sans-serif;
    }

    .modal-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn.primary {
      background: #2563eb;
      color: white;
    }

    .btn.primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn.secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn.secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class CustomerTasksComponent implements OnInit {
  @Input() customerId!: number;

  tasks: CustomerTaskDto[] = [];
  users: Array<{ id: number; email: string }> = [];
  loading = false;
  creating = false;
  updating = false;
  error = '';
  showCreateDialog = false;
  showEditDialog = false;
  
  newTask = {
    title: '',
    status: 'offen',
    dueDateStr: '',
    customerId: 0,
    assignedToUserId: 0
  };

  editTask = {
    id: 0,
    title: '',
    status: 'offen',
    dueDateStr: ''
  };

  constructor(
    private taskService: TaskService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    if (this.customerId) {
      this.loadTasks();
      this.loadUsers();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    this.taskService.getByCustomerId(this.customerId).subscribe({
      next: (tasks) => {
        this.tasks = tasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Aufgaben';
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.api.getAdvisors().subscribe({
      next: (users) => {
        this.users = users;
        // Set current user as default
        const userId = this.auth.getUserId();
        if (userId) {
          this.newTask.assignedToUserId = userId;
        }
      },
      error: () => {
        this.toast.show('Fehler beim Laden der Benutzer', 'error');
      }
    });
  }

  cancelCreate(): void {
    this.showCreateDialog = false;
    const currentUserId = this.auth.getUserId();
    this.newTask = {
      title: '',
      status: 'offen',
      dueDateStr: '',
      customerId: 0,
      assignedToUserId: currentUserId || 0
    };
  }

  confirmCreate(): void {
    if (!this.newTask.title || !this.newTask.assignedToUserId) return;

    this.creating = true;
    const task: CreateCustomerTaskDto = {
      title: this.newTask.title,
      status: this.newTask.status,
      dueDate: this.newTask.dueDateStr ? new Date(this.newTask.dueDateStr).toISOString() : undefined,
      customerId: this.customerId,
      assignedToUserId: this.newTask.assignedToUserId
    };

    this.taskService.create(task).subscribe({
      next: () => {
        this.toast.show('Aufgabe erfolgreich erstellt', 'success');
        this.creating = false;
        this.showCreateDialog = false;
        const currentUserId = this.auth.getUserId();
        this.newTask = {
          title: '',
          status: 'offen',
          dueDateStr: '',
          customerId: 0,
          assignedToUserId: currentUserId || 0
        };
        this.loadTasks();
      },
      error: () => {
        this.toast.show('Fehler beim Erstellen der Aufgabe', 'error');
        this.creating = false;
      }
    });
  }

  startEdit(task: CustomerTaskDto): void {
    this.editTask = {
      id: task.id,
      title: task.title,
      status: task.status,
      dueDateStr: task.dueDate ? task.dueDate.split('T')[0] : ''
    };
    this.showEditDialog = true;
  }

  cancelEdit(): void {
    this.showEditDialog = false;
    this.editTask = {
      id: 0,
      title: '',
      status: 'offen',
      dueDateStr: ''
    };
  }

  confirmEdit(): void {
    if (!this.editTask.title) return;

    this.updating = true;
    const update = {
      title: this.editTask.title,
      status: this.editTask.status,
      dueDate: this.editTask.dueDateStr ? new Date(this.editTask.dueDateStr).toISOString() : undefined
    };

    this.taskService.update(this.editTask.id, update).subscribe({
      next: () => {
        this.toast.show('Aufgabe erfolgreich aktualisiert', 'success');
        this.updating = false;
        this.showEditDialog = false;
        this.loadTasks();
      },
      error: () => {
        this.toast.show('Fehler beim Aktualisieren der Aufgabe', 'error');
        this.updating = false;
      }
    });
  }

  async deleteTask(task: CustomerTaskDto): Promise<void> {
    const ok = await this.confirm.open(
      `Möchten Sie die Aufgabe "${task.title}" wirklich löschen?`,
      'Löschen',
      'Abbrechen'
    );
    
    if (!ok) return;
    
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.toast.show('Aufgabe erfolgreich gelöscht', 'success');
        this.loadTasks();
      },
      error: () => {
        this.toast.show('Fehler beim Löschen der Aufgabe', 'error');
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
}
