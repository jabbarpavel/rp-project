import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { PermissionService } from '../../core/services/permission.service';

interface CustomerNoteDto {
  id: number;
  customerId: number;
  text: string;
  createdByUserId: number;
  createdByUserName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  updatedByUserId?: number | null;
  updatedByUserName?: string | null;
  hasHistory?: boolean;
}

interface CustomerNoteHistoryDto {
  id: number;
  customerNoteId: number;
  text: string;
  editedByUserId: number;
  editedByUserName?: string | null;
  editedAt: string;
}

@Component({
  selector: 'app-customer-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card notes-card">
      <div class="card-header">
        <h2>Notizen</h2>
      </div>

      <div class="note-input">
        <textarea
          [(ngModel)]="newNoteText"
          rows="3"
          maxlength="2000"
          placeholder="Notiz eingeben (mind. {{ minLength }} Zeichen)…"
          [disabled]="saving"
        ></textarea>
        <div class="input-footer">
          <span class="hint" [class.error]="newNoteText.trim().length > 0 && newNoteText.trim().length < minLength">
            {{ newNoteText.trim().length }} / {{ minLength }} Zeichen
          </span>
          <button
            class="btn primary"
            type="button"
            (click)="saveNote()"
            [disabled]="saving || newNoteText.trim().length < minLength"
          >
            {{ saving ? 'Speichern…' : 'Speichern' }}
          </button>
        </div>
      </div>

      <div class="notes-list" *ngIf="!loading && notes.length > 0">
        <table>
          <thead>
            <tr>
              <th class="col-date">Datum / Zeit</th>
              <th class="col-user">Berater</th>
              <th class="col-text">Notiz</th>
              <th class="col-actions" *ngIf="canManage">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let n of notes">
              <tr [class.editing]="editingId === n.id">
                <td class="col-date">{{ formatTimestamp(n.createdAt) }}</td>
                <td class="col-user">{{ n.createdByUserName || '–' }}</td>
                <td class="col-text">
                  <ng-container *ngIf="editingId !== n.id; else editTpl">
                    {{ n.text }}
                    <div class="edited-meta" *ngIf="n.updatedAt">
                      Bearbeitet {{ formatTimestamp(n.updatedAt) }}{{ n.updatedByUserName ? ' von ' + n.updatedByUserName : '' }}
                    </div>
                  </ng-container>
                  <ng-template #editTpl>
                    <textarea
                      class="edit-textarea"
                      [(ngModel)]="editText"
                      rows="3"
                      maxlength="2000"
                      [disabled]="updating"
                    ></textarea>
                    <div class="edit-hint">
                      <span class="hint" [class.error]="editText.trim().length > 0 && editText.trim().length < minLength">
                        {{ editText.trim().length }} / {{ minLength }} Zeichen
                      </span>
                    </div>
                  </ng-template>
                </td>
                <td class="col-actions" *ngIf="canManage">
                  <ng-container *ngIf="editingId !== n.id; else editActions">
                    <div class="action-stack">
                      <button class="link-btn" type="button" (click)="startEdit(n)" title="Notiz bearbeiten">Bearbeiten</button>
                      <button class="link-btn danger" type="button" (click)="deleteNote(n)" title="Notiz löschen">Löschen</button>
                      <button
                        *ngIf="n.hasHistory"
                        class="link-btn muted"
                        type="button"
                        (click)="toggleHistory(n)"
                        title="Bearbeitungsverlauf anzeigen"
                      >{{ expandedHistoryId === n.id ? 'Verlauf ausblenden' : 'Verlauf' }}</button>
                    </div>
                  </ng-container>
                  <ng-template #editActions>
                    <div class="action-stack">
                      <button
                        class="link-btn save"
                        type="button"
                        (click)="saveEdit(n)"
                        [disabled]="updating || editText.trim().length < minLength"
                      >{{ updating ? 'Speichern…' : 'Speichern' }}</button>
                      <button class="link-btn" type="button" (click)="cancelEdit()" [disabled]="updating">Abbrechen</button>
                    </div>
                  </ng-template>
                </td>
              </tr>
              <tr *ngIf="expandedHistoryId === n.id" class="history-row">
                <td [attr.colspan]="canManage ? 4 : 3">
                  <div class="history-box">
                    <div class="history-title">Bearbeitungsverlauf</div>
                    <div *ngIf="historyLoading" class="empty">Lade Verlauf…</div>
                    <div *ngIf="!historyLoading && historyEntries.length === 0" class="empty">Kein Verlauf vorhanden.</div>
                    <ul *ngIf="!historyLoading && historyEntries.length > 0" class="history-list">
                      <li *ngFor="let h of historyEntries">
                        <div class="history-meta">
                          {{ formatTimestamp(h.editedAt) }} · ersetzt durch {{ h.editedByUserName || '–' }}
                        </div>
                        <div class="history-text">{{ h.text }}</div>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>

      <p *ngIf="!loading && notes.length === 0" class="empty">
        Keine Notizen vorhanden.
      </p>

      <p *ngIf="loading" class="empty">Lade Notizen…</p>
    </section>
  `,
  styles: [`
    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
      padding: 1.1rem 1.25rem;
    }

    .card-header {
      margin-bottom: .65rem;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #111827;
    }

    .note-input {
      display: flex;
      flex-direction: column;
      gap: .5rem;
      margin-bottom: .9rem;
    }

    .note-input textarea {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      min-height: 70px;
      padding: .55rem .7rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: inherit;
      font-size: .85rem;
      color: #111827;
      background: #fff;
      outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }

    .note-input textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, .15);
    }

    .input-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: .5rem;
    }

    .hint {
      font-size: .72rem;
      color: #6b7280;
    }

    .hint.error {
      color: #b91c1c;
    }

    .btn {
      border-radius: 999px;
      padding: .4rem 1rem;
      font-size: .8rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background-color .15s ease, transform .05s ease;
    }

    .btn.primary {
      background: #2563eb;
      color: #fff;
    }

    .btn.primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .btn:active:not(:disabled) {
      transform: translateY(1px);
    }

    .notes-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #f3f4f6;
      border-radius: 8px;
    }

    .notes-list table {
      width: 100%;
      border-collapse: collapse;
      font-size: .78rem;
    }

    .notes-list thead {
      position: sticky;
      top: 0;
      background: #f9fafb;
      z-index: 1;
    }

    .notes-list th {
      text-align: left;
      padding: .5rem .65rem;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    .notes-list td {
      padding: .5rem .65rem;
      vertical-align: top;
      border-bottom: 1px solid #f3f4f6;
      color: #111827;
    }

    .notes-list tr:last-child td {
      border-bottom: none;
    }

    .col-date {
      width: 1%;
      white-space: nowrap;
      color: #4b5563;
    }

    .col-user {
      width: 1%;
      white-space: nowrap;
      color: #4b5563;
    }

    .col-text {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .col-actions {
      width: 1%;
      white-space: nowrap;
      text-align: right;
    }

    .link-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: .75rem;
      padding: 0;
      color: #2563eb;
      text-align: left;
    }

    .link-btn:disabled {
      color: #9ca3af;
      cursor: not-allowed;
    }

    .link-btn.danger {
      color: #dc2626;
    }

    .link-btn.save {
      color: #047857;
      font-weight: 600;
    }

    .link-btn.muted {
      color: #6b7280;
      font-size: .72rem;
    }

    .link-btn:hover:not(:disabled) {
      text-decoration: underline;
    }

    .action-stack {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: .25rem;
    }

    .edit-textarea {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      min-height: 60px;
      padding: .45rem .55rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
      font-size: .78rem;
      color: #111827;
      background: #fff;
      outline: none;
    }

    .edit-textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, .15);
    }

    .edit-hint {
      margin-top: .25rem;
    }

    .edited-meta {
      margin-top: .25rem;
      font-size: .68rem;
      font-style: italic;
      color: #6b7280;
    }

    tr.editing > td {
      background: #f8fafc;
    }

    .history-row > td {
      background: #f9fafb;
      padding: .55rem .75rem !important;
    }

    .history-box {
      border-left: 3px solid #cbd5e1;
      padding: .25rem .65rem;
    }

    .history-title {
      font-size: .72rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: .35rem;
      text-transform: uppercase;
      letter-spacing: .02em;
    }

    .history-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }

    .history-list li {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: .4rem .55rem;
    }

    .history-meta {
      font-size: .68rem;
      color: #6b7280;
      margin-bottom: .15rem;
    }

    .history-text {
      font-size: .78rem;
      color: #111827;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .empty {
      margin: .5rem 0 0;
      color: #6b7280;
      font-size: .82rem;
      text-align: center;
    }
  `]
})
export class CustomerNotesComponent implements OnInit {
  @Input() customerId!: number;

  readonly minLength = 10;

  notes: CustomerNoteDto[] = [];
  newNoteText = '';
  loading = false;
  saving = false;
  canManage = false;

  editingId: number | null = null;
  editText = '';
  updating = false;

  expandedHistoryId: number | null = null;
  historyEntries: CustomerNoteHistoryDto[] = [];
  historyLoading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private permissions: PermissionService
  ) {}

  ngOnInit(): void {
    this.canManage = this.permissions.canDeleteCustomers();
    this.loadNotes();
  }

  loadNotes(): void {
    if (!this.customerId) return;
    this.loading = true;
    this.api.get<CustomerNoteDto[]>(`/api/customer/${this.customerId}/notes`).subscribe({
      next: (res) => {
        this.notes = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.toast.show('Notizen konnten nicht geladen werden', 'error');
        this.loading = false;
      }
    });
  }

  saveNote(): void {
    const text = this.newNoteText.trim();
    if (text.length < this.minLength) return;

    this.saving = true;
    this.api.post<CustomerNoteDto>(`/api/customer/${this.customerId}/notes`, { text }).subscribe({
      next: (created) => {
        this.notes = [created, ...this.notes];
        this.newNoteText = '';
        this.saving = false;
        this.toast.show('Notiz gespeichert', 'success');
      },
      error: (err) => {
        this.saving = false;
        const msg = typeof err?.error === 'string' ? err.error : 'Fehler beim Speichern';
        this.toast.show(msg, 'error');
      }
    });
  }

  async deleteNote(note: CustomerNoteDto): Promise<void> {
    const ok = await this.confirm.open('Diese Notiz wirklich löschen?', 'Löschen', 'Abbrechen');
    if (!ok) return;

    this.api.delete<void>(`/api/customer/${this.customerId}/notes/${note.id}`).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== note.id);
        if (this.editingId === note.id) this.cancelEdit();
        if (this.expandedHistoryId === note.id) {
          this.expandedHistoryId = null;
          this.historyEntries = [];
        }
        this.toast.show('Notiz gelöscht', 'success');
      },
      error: () => this.toast.show('Fehler beim Löschen', 'error')
    });
  }

  startEdit(note: CustomerNoteDto): void {
    this.editingId = note.id;
    this.editText = note.text;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editText = '';
    this.updating = false;
  }

  saveEdit(note: CustomerNoteDto): void {
    const text = this.editText.trim();
    if (text.length < this.minLength) return;

    this.updating = true;
    this.api.put<CustomerNoteDto>(`/api/customer/${this.customerId}/notes/${note.id}`, { text }).subscribe({
      next: (updated) => {
        this.notes = this.notes.map(n => n.id === updated.id ? updated : n);
        this.updating = false;
        this.cancelEdit();
        // If the history panel is open for this note, refresh it.
        if (this.expandedHistoryId === updated.id) {
          this.loadHistory(updated.id);
        }
        this.toast.show('Notiz aktualisiert', 'success');
      },
      error: (err) => {
        this.updating = false;
        const msg = typeof err?.error === 'string' ? err.error : 'Fehler beim Aktualisieren';
        this.toast.show(msg, 'error');
      }
    });
  }

  toggleHistory(note: CustomerNoteDto): void {
    if (this.expandedHistoryId === note.id) {
      this.expandedHistoryId = null;
      this.historyEntries = [];
      return;
    }
    this.expandedHistoryId = note.id;
    this.loadHistory(note.id);
  }

  private loadHistory(noteId: number): void {
    this.historyLoading = true;
    this.historyEntries = [];
    this.api.get<CustomerNoteHistoryDto[]>(`/api/customer/${this.customerId}/notes/${noteId}/history`).subscribe({
      next: (res) => {
        this.historyEntries = res ?? [];
        this.historyLoading = false;
      },
      error: () => {
        this.historyLoading = false;
        this.toast.show('Verlauf konnte nicht geladen werden', 'error');
      }
    });
  }

  formatTimestamp(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
