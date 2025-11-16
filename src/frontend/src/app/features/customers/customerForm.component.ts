import { Component, EventEmitter, Input, Output, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

type AdvisorDto = {
  id: number;
  email: string;
  firstName?: string;
  name?: string;
};

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <form (submit)="onSubmit($event)" class="customer-form">
        <div class="form-group">
          <label for="firstName">Vorname</label>
          <input id="firstName" type="text" [(ngModel)]="model.firstName" name="firstName" placeholder="Vorname eingeben"/>
        </div>

        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" type="text" [(ngModel)]="model.name" name="name" placeholder="Kundenname eingeben" required/>
        </div>

        <div class="form-group">
          <label for="ahv">AHV-Nummer</label>
          <input id="ahv" type="text" name="ahvNum" maxlength="16" [(ngModel)]="model.ahvNum" (input)="formatAhvNumber()" placeholder="756.xxxx.xxxx.xx" required/>
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input id="email" type="email" [(ngModel)]="model.email" name="email" placeholder="E-Mail-Adresse eingeben" required/>
        </div>

        <!-- Berater: Autocomplete-Dropdown -->
        <div class="form-group advisor">
          <label for="advisor">Berater</label>
          <input
            id="advisor"
            type="text"
            [(ngModel)]="advisorSearch"
            (input)="onType()"
            (focus)="onFocus()"
            (keydown)="onKey($event)"
            name="advisorSearch"
            placeholder="Berater suchen (Name oder E-Mail)…"
            autocomplete="off"
            aria-autocomplete="list"
            aria-expanded="{{open}}"
          />

          <ul *ngIf="open && items.length" class="dropdown" role="listbox">
            <li
              *ngFor="let a of items; let i = index"
              (click)="pick(a)"
              [class.active]="i === idx"
              role="option"
              [attr.aria-selected]="i === idx"
            >
              {{ formatAdvisor(a) }}
            </li>
          </ul>

          <small class="hint" *ngIf="!model.advisorId && !advisorSearch">– Kein Berater –</small>
          <small class="hint" *ngIf="model.advisorId && !advisorSearch">Aktuell: {{ selectedAdvisorLabel }}</small>
        </div>

        <div class="button-group">
          <button type="submit" [disabled]="loading">{{ submitLabel }}</button>
          <button type="button" class="cancel" (click)="cancel.emit()">Abbrechen</button>
        </div>

        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  `,
  styles: [`
    .form-container{background:#fff;padding:2rem;border-radius:12px;max-width:480px;margin:2rem auto;box-shadow:0 2px 10px rgba(0,0,0,.05)}
    .customer-form{display:flex;flex-direction:column;gap:1.2rem}
    .form-group{display:flex;flex-direction:column;position:relative}
    label{font-weight:600;margin-bottom:.4rem;color:#1f2937}
    input{padding:.7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;transition:border-color .2s}
    input:focus{border-color:#3b82f6;outline:none}
    .button-group{display:flex;justify-content:flex-end;gap:.8rem}
    button{padding:.6rem 1.2rem;border:none;border-radius:8px;cursor:pointer;font-weight:600}
    button[type="submit"]{background:#3b82f6;color:#fff}
    button.cancel{background:#e5e7eb;color:#111827}
    .error{color:#dc2626;text-align:center;margin-top:1rem;font-size:.9rem}
    .advisor{position:relative}
    .dropdown{position:absolute;left:0;right:0;top:100%;margin:.25rem 0 0;padding:0;list-style:none;background:#fff;border:1px solid #e5e7eb;border-radius:8px;max-height:220px;overflow:auto;z-index:10}
    .dropdown li{padding:.5rem .75rem;cursor:pointer}
    .dropdown li.active,.dropdown li:hover{background:#eff6ff}
    .hint{margin-top:.3rem;color:#6b7280;font-size:.8rem}
    input#ahv{font-family:monospace;letter-spacing:.05rem}
  `]
})
export class CustomerFormComponent implements OnInit {
  @Input() model = { firstName: '', name: '', email: '', ahvNum: '', advisorId: null as number | null };
  @Input() loading = false;
  @Input() error = '';
  @Input() submitLabel = 'Speichern';
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  advisorSearch = '';
  items: AdvisorDto[] = [];
  selectedAdvisorLabel = '';

  open = false;
  idx = -1;
  private timer: any;

  constructor(private api: ApiService, private el: ElementRef) {}

  ngOnInit(): void {
    if (this.model.advisorId) this.resolveAdvisorLabel(this.model.advisorId);
  }

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
    this.idx = -1;
    const term = this.advisorSearch.trim();
    if (term.length < 2) { this.items = []; this.open = false; return; }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.api.getAdvisors(term).subscribe({
        next: list => { this.items = list || []; this.open = this.items.length > 0; },
        error: () => { this.items = []; this.open = false; }
      });
    }, 250);
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

  formatAdvisor(a: AdvisorDto): string {
    const fn = a.firstName?.trim() || '';
    const ln = a.name?.trim() || '';
    const email = a.email;
    const fullName = fn && ln ? `${fn} ${ln}` : fn || ln;

    return fullName ? `${fullName} (${email})` : email;
  }

  pick(a: AdvisorDto) {
    this.model.advisorId = a.id;
    this.selectedAdvisorLabel = this.formatAdvisor(a);
    this.advisorSearch = '';
    this.items = [];
    this.open = false;
  }

  resolveAdvisorLabel(id: number) {
    this.api.getAdvisors().subscribe({
      next: list => {
        const found = (list || []).find((x: AdvisorDto) => x.id === id);
        this.selectedAdvisorLabel = found ? this.formatAdvisor(found) : '';
      }
    });
  }

  onSubmit(ev: Event) {
    ev.preventDefault();
    if (this.loading) return;
    this.submit.emit();
  }

  formatAhvNumber(): void {
    let d = this.model.ahvNum.replace(/\D/g, '');
    if (!d.startsWith('756')) d = '756' + d.replace(/^756/, '');
    d = d.slice(0, 13);
    let f = '';
    if (d.length > 3) {
      f = d.substring(0,3)+'.';
      if (d.length > 7) {
        f += d.substring(3,7)+'.';
        if (d.length > 11) { f += d.substring(7,11)+'.'+d.substring(11); }
        else { f += d.substring(7); }
      } else { f += d.substring(3); }
    } else f = d;
    this.model.ahvNum = f;
  }
}
