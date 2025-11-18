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
        <!-- Hauptansprechperson Checkbox -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="model.isPrimaryContact"
              name="isPrimaryContact"
            />
            <span>Hauptansprechperson</span>
          </label>
        </div>

        <!-- Basisdaten -->
        <div class="form-group">
          <label for="firstName">Vorname</label>
          <input
            id="firstName"
            type="text"
            [(ngModel)]="model.firstName"
            name="firstName"
            placeholder="Vorname eingeben"
          />
        </div>

        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            [(ngModel)]="model.name"
            name="name"
            placeholder="Kundenname eingeben"
            required
          />
        </div>

        <div class="form-group">
          <label for="ahv">AHV-Nummer</label>
          <input
            id="ahv"
            type="text"
            name="ahvNum"
            maxlength="16"
            [(ngModel)]="model.ahvNum"
            (input)="formatAhvNumber()"
            placeholder="756.xxxx.xxxx.xx"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input
            id="email"
            type="email"
            [(ngModel)]="model.email"
            name="email"
            placeholder="E-Mail-Adresse eingeben"
            required
          />
        </div>

        <!-- Zivilstand -->
        <div class="form-group">
          <label for="civilStatus">Zivilstand</label>
          <select
            id="civilStatus"
            [(ngModel)]="model.civilStatus"
            name="civilStatus"
          >
            <option [ngValue]="null">Bitte auswählen</option>
            <option value="ledig">Ledig</option>
            <option value="verheiratet">Verheiratet</option>
            <option value="getrennt">Getrennt</option>
            <option value="geschieden">Geschieden</option>
            <option value="verwitwet">Verwitwet</option>
          </select>
        </div>

        <!-- Konfession -->
        <div class="form-group">
          <label for="religion">Konfession</label>
          <select
            id="religion"
            [(ngModel)]="model.religion"
            name="religion"
          >
            <option [ngValue]="null">Bitte auswählen</option>
            <option value="römisch-katholisch">römisch-katholisch</option>
            <option value="evangelisch-reformiert">evangelisch-reformiert</option>
            <option value="christkatholisch">christkatholisch</option>
            <option value="islamisch">islamisch</option>
            <option value="jüdisch">jüdisch</option>
            <option value="keine">keine</option>
            <option value="andere">andere</option>
          </select>
        </div>

        <!-- Geschlecht -->
        <div class="form-group">
          <label for="gender">Geschlecht</label>
          <select
            id="gender"
            [(ngModel)]="model.gender"
            name="gender"
          >
            <option [ngValue]="null">Bitte auswählen</option>
            <option value="männlich">männlich</option>
            <option value="weiblich">weiblich</option>
            <option value="unbekannt">unbekannt</option>
          </select>
        </div>

        <!-- Anrede (Du / Sie Toggle) -->
        <div class="form-group">
          <label>Anrede</label>
          <div class="toggle-group">
            <label class="toggle-option">
              <input
                type="radio"
                name="salutation"
                [value]="'Du'"
                [(ngModel)]="model.salutation"
              />
              Du
            </label>
            <label class="toggle-option">
              <input
                type="radio"
                name="salutation"
                [value]="'Sie'"
                [(ngModel)]="model.salutation"
              />
              Sie
            </label>
          </div>
        </div>

        <!-- Geburtsdatum -->
        <div class="form-group">
          <label for="birthDate">Geburtsdatum</label>
          <input
            id="birthDate"
            type="date"
            [(ngModel)]="model.birthDate"
            name="birthDate"
          />
          <small class="hint">Format: TT.MM.JJJJ (Browserdarstellung kann abweichen)</small>
        </div>

        <!-- Beruf -->
        <div class="form-group">
          <label for="profession">Beruf</label>
          <input
            id="profession"
            type="text"
            [(ngModel)]="model.profession"
            name="profession"
            placeholder="Beruf eingeben"
          />
        </div>

        <!-- Sprache -->
        <div class="form-group">
          <label for="language">Sprache</label>
          <select
            id="language"
            [(ngModel)]="model.language"
            name="language"
          >
            <option [ngValue]="null">Bitte auswählen</option>
            <option value="deutsch">Deutsch</option>
            <option value="französisch">Französisch</option>
            <option value="italienisch">Italienisch</option>
            <option value="englisch">Englisch</option>
            <option value="andere">Andere</option>
          </select>
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
            [attr.aria-expanded]="open"
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
    .form-container{background:#fff;padding:2rem;border-radius:12px;max-width:620px;margin:2rem auto;box-shadow:0 2px 10px rgba(0,0,0,.05)}
    .customer-form{display:flex;flex-direction:column;gap:1.2rem}
    .form-group{display:flex;flex-direction:column;position:relative}
    label{font-weight:600;margin-bottom:.4rem;color:#1f2937}
    input, select{padding:.7rem;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;transition:border-color .2s;background:#fff}
    input:focus, select:focus{border-color:#3b82f6;outline:none}
    .button-group{display:flex;justify-content:flex-end;gap:.8rem;margin-top:.5rem}
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
    .toggle-group{display:flex;gap:.5rem}
    .toggle-option{display:flex;align-items:center;gap:.25rem;padding:.25rem .6rem;border-radius:999px;border:1px solid #d1d5db;cursor:pointer;font-size:.85rem;color:#374151}
    .toggle-option input{margin:0}
    .checkbox-group{padding-bottom:.5rem;border-bottom:1px solid #e5e7eb;margin-bottom:.5rem}
    .checkbox-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-weight:500}
    .checkbox-label input[type="checkbox"]{width:18px;height:18px;cursor:pointer}
  `]
})
export class CustomerFormComponent implements OnInit {
  @Input() model = {
    firstName: '',
    name: '',
    email: '',
    ahvNum: '',
    advisorId: null as number | null,

    civilStatus: null as string | null,
    religion: null as string | null,
    gender: null as string | null,
    salutation: null as string | null,
    birthDate: null as string | null,
    profession: '',
    language: null as string | null,
    isPrimaryContact: true
  };
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
