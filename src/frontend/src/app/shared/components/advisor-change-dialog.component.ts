import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-advisor-change-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay">
      <div class="dialog" role="dialog" aria-modal="true">
        <h3>Berater wechseln</h3>
        <p>Bitte E-Mail des neuen Beraters auswählen:</p>

        <div class="field">
          <input
            #advisorInput
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onType()"
            (focus)="onFocus()"
            (keydown)="onKey($event)"
            placeholder="E-Mail des Beraters"
            class="input"
            autocomplete="off"
            aria-autocomplete="list"
            aria-expanded="{{open}}"
          />

          <ul
            *ngIf="open && items.length"
            class="dropdown"
            role="listbox"
          >
            <li
              *ngFor="let a of items; let i = index"
              (click)="pick(a)"
              [class.active]="i === idx"
              role="option"
              [attr.aria-selected]="i === idx"
            >
              {{ a.email }}
            </li>
          </ul>
        </div>

        <div class="hint" *ngIf="!open && !selected">– Kein Berater ausgewählt –</div>
        <div class="hint" *ngIf="selected">Aktuell gewählt: {{ selected.email }}</div>

        <div *ngIf="loading" class="loading">Suche…</div>
        <div *ngIf="error" class="error">{{ error }}</div>

        <div class="buttons">
          <button class="confirm" (click)="confirm()" [disabled]="!selected">Übernehmen</button>
          <button class="cancel" (click)="cancel()">Abbrechen</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}
    .dialog{background:#fff;border-radius:10px;padding:1.5rem;box-shadow:0 4px 16px rgba(0,0,0,.2);width:380px;max-width:95%;text-align:center}
    h3{margin:0 0 .5rem;font-size:1.25rem}
    .field{position:relative}
    .input{width:100%;padding:.5rem;border:1px solid #d1d5db;border-radius:6px}
    .dropdown{position:absolute;left:0;right:0;top:100%;margin:.25rem 0 0;padding:0;list-style:none;background:#fff;border:1px solid #e5e7eb;border-radius:6px;max-height:200px;overflow:auto;z-index:10;text-align:left}
    .dropdown li{padding:.5rem .75rem;cursor:pointer}
    .dropdown li.active,.dropdown li:hover{background:#eff6ff}
    .buttons{display:flex;justify-content:center;gap:1rem;margin-top:1rem}
    .confirm{background:#2563eb;color:#fff;border:none;padding:.5rem 1rem;border-radius:6px;font-weight:600;cursor:pointer}
    .confirm:disabled{opacity:.5;cursor:not-allowed}
    .cancel{background:#e5e7eb;color:#111;border:none;padding:.5rem 1rem;border-radius:6px;cursor:pointer}
    .loading,.error,.hint{margin-top:.5rem;font-size:.9rem}
    .error{color:#dc2626}
    .hint{color:#6b7280}
  `]
})
export class AdvisorChangeDialogComponent {
  @Input() advisorEmail = '';
  @Output() confirmed = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  searchTerm = '';
  items: Array<{ id: number; email: string }> = [];
  selected: { id: number; email: string } | null = null;

  loading = false;
  error = '';
  open = false;
  idx = -1;
  private timer: any;

  constructor(private api: ApiService, private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.el.nativeElement.contains(ev.target)) this.open = false;
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.open = false; }

  onFocus() {
    if (this.items.length) this.open = true;
  }

  onType() {
    this.selected = null;
    this.error = '';
    this.idx = -1;

    const term = this.searchTerm.trim();
    if (term.length < 2) { this.items = []; this.open = false; return; }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.fetch(term), 250);
  }

  onKey(e: KeyboardEvent) {
    if (!this.open && this.items.length) this.open = true;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.items.length) return;
      this.idx = (this.idx + 1) % this.items.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.items.length) return;
      this.idx = (this.idx + this.items.length - 1) % this.items.length;
    } else if (e.key === 'Enter') {
      if (this.open && this.idx >= 0 && this.items[this.idx]) {
        e.preventDefault();
        this.pick(this.items[this.idx]);
      }
    }
  }

  fetch(q: string) {
    this.loading = true;
    this.api.getAdvisors(q).subscribe({
      next: list => { this.items = list || []; this.open = this.items.length > 0; this.loading = false; },
      error: () => { this.items = []; this.loading = false; this.error = 'Fehler bei der Suche.'; }
    });
  }

  pick(a: { id: number; email: string }) {
    this.selected = a;
    this.searchTerm = a.email;
    this.open = false;
  }

  confirm() {
    if (this.selected) this.confirmed.emit(this.selected.id);
  }

  cancel() { this.closed.emit(); }
}
