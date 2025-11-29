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
        
        <!-- Customer Type Selection -->
        <div class="form-group type-selection">
          <label>Kundentyp</label>
          <div class="type-toggle">
            <button 
              type="button" 
              class="type-btn" 
              [class.active]="model.customerType === 0"
              (click)="setCustomerType(0)"
            >
              Privatperson
            </button>
            <button 
              type="button" 
              class="type-btn" 
              [class.active]="model.customerType === 1"
              (click)="setCustomerType(1)"
            >
              Organisation
            </button>
          </div>
        </div>

        <!-- ====== PRIVATPERSON FORM ====== -->
        <ng-container *ngIf="model.customerType === 0">
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

          <!-- Berater -->
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

          <!-- Anrede -->
          <div class="form-group">
            <label>Anrede</label>
            <div class="toggle-group">
              <label class="toggle-option">
                <input type="radio" name="salutation" [value]="'Du'" [(ngModel)]="model.salutation" />
                Du
              </label>
              <label class="toggle-option">
                <input type="radio" name="salutation" [value]="'Sie'" [(ngModel)]="model.salutation" />
                Sie
              </label>
            </div>
          </div>

          <!-- Geschlecht -->
          <div class="form-group">
            <label for="gender">Geschlecht</label>
            <select id="gender" [(ngModel)]="model.gender" name="gender">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="männlich">männlich</option>
              <option value="weiblich">weiblich</option>
              <option value="unbekannt">unbekannt</option>
            </select>
          </div>

          <!-- Sprache -->
          <div class="form-group">
            <label for="language">Sprache</label>
            <select id="language" [(ngModel)]="model.language" name="language">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="deutsch">Deutsch</option>
              <option value="französisch">Französisch</option>
              <option value="italienisch">Italienisch</option>
              <option value="englisch">Englisch</option>
              <option value="andere">Andere</option>
            </select>
          </div>

          <!-- Vorname -->
          <div class="form-group">
            <label for="firstName">Vorname</label>
            <input id="firstName" type="text" [(ngModel)]="model.firstName" name="firstName" placeholder="Vorname eingeben" />
          </div>

          <!-- Name -->
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" type="text" [(ngModel)]="model.name" name="name" placeholder="Nachname eingeben" required />
          </div>

          <!-- Zivilstand -->
          <div class="form-group">
            <label for="civilStatus">Zivilstand</label>
            <select id="civilStatus" [(ngModel)]="model.civilStatus" name="civilStatus">
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
            <select id="religion" [(ngModel)]="model.religion" name="religion">
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

          <!-- Beruf -->
          <div class="form-group">
            <label for="profession">Beruf</label>
            <input id="profession" type="text" [(ngModel)]="model.profession" name="profession" placeholder="Beruf eingeben" />
          </div>

          <!-- E-Mail -->
          <div class="form-group">
            <label for="email">E-Mail</label>
            <input id="email" type="email" [(ngModel)]="model.email" name="email" placeholder="E-Mail-Adresse eingeben" required />
          </div>

          <!-- AHV-Nummer -->
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
            />
          </div>

          <!-- Geburtsdatum -->
          <div class="form-group">
            <label for="birthDate">Geburtsdatum</label>
            <input id="birthDate" type="date" [(ngModel)]="model.birthDate" name="birthDate" />
            <small class="hint">Format: TT.MM.JJJJ</small>
          </div>

          <!-- Address Section -->
          <div class="section-separator">
            <h3>Adresse</h3>
          </div>

          <div class="form-group">
            <label for="street">Strasse</label>
            <input id="street" type="text" [(ngModel)]="model.street" name="street" placeholder="Strasse und Hausnummer" />
          </div>

          <div class="form-group">
            <label for="postalCode">PLZ</label>
            <input id="postalCode" type="text" [(ngModel)]="model.postalCode" name="postalCode" placeholder="Postleitzahl" maxlength="4" />
          </div>

          <div class="form-group">
            <label for="locality">Ort</label>
            <input id="locality" type="text" [(ngModel)]="model.locality" name="locality" placeholder="Ortschaft" />
          </div>

          <div class="form-group">
            <label for="canton">Kanton</label>
            <select id="canton" [(ngModel)]="model.canton" name="canton">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="AG">Aargau (AG)</option>
              <option value="AI">Appenzell Innerrhoden (AI)</option>
              <option value="AR">Appenzell Ausserrhoden (AR)</option>
              <option value="BE">Bern (BE)</option>
              <option value="BL">Basel-Landschaft (BL)</option>
              <option value="BS">Basel-Stadt (BS)</option>
              <option value="FR">Freiburg (FR)</option>
              <option value="GE">Genf (GE)</option>
              <option value="GL">Glarus (GL)</option>
              <option value="GR">Graubünden (GR)</option>
              <option value="JU">Jura (JU)</option>
              <option value="LU">Luzern (LU)</option>
              <option value="NE">Neuenburg (NE)</option>
              <option value="NW">Nidwalden (NW)</option>
              <option value="OW">Obwalden (OW)</option>
              <option value="SG">St. Gallen (SG)</option>
              <option value="SH">Schaffhausen (SH)</option>
              <option value="SO">Solothurn (SO)</option>
              <option value="SZ">Schwyz (SZ)</option>
              <option value="TG">Thurgau (TG)</option>
              <option value="TI">Tessin (TI)</option>
              <option value="UR">Uri (UR)</option>
              <option value="VD">Waadt (VD)</option>
              <option value="VS">Wallis (VS)</option>
              <option value="ZG">Zug (ZG)</option>
              <option value="ZH">Zürich (ZH)</option>
            </select>
          </div>
        </ng-container>

        <!-- ====== ORGANISATION FORM ====== -->
        <ng-container *ngIf="model.customerType === 1">
          <!-- Berater -->
          <div class="form-group advisor">
            <label for="advisor-org">Berater</label>
            <input
              id="advisor-org"
              type="text"
              [(ngModel)]="advisorSearch"
              (input)="onType()"
              (focus)="onFocus()"
              (keydown)="onKey($event)"
              name="advisorSearchOrg"
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

          <!-- Sprache -->
          <div class="form-group">
            <label for="language-org">Sprache</label>
            <select id="language-org" [(ngModel)]="model.language" name="languageOrg">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="deutsch">Deutsch</option>
              <option value="französisch">Französisch</option>
              <option value="italienisch">Italienisch</option>
              <option value="englisch">Englisch</option>
              <option value="andere">Andere</option>
            </select>
          </div>

          <!-- E-Mail -->
          <div class="form-group">
            <label for="email-org">E-Mail</label>
            <input id="email-org" type="email" [(ngModel)]="model.email" name="emailOrg" placeholder="E-Mail-Adresse eingeben" required />
          </div>

          <!-- Firmenname -->
          <div class="form-group">
            <label for="companyName">Firmenname</label>
            <input id="companyName" type="text" [(ngModel)]="model.companyName" name="companyName" placeholder="Firmenname eingeben" required />
          </div>

          <!-- Rechtsform -->
          <div class="form-group">
            <label for="legalForm">Rechtsform</label>
            <select id="legalForm" [(ngModel)]="model.legalForm" name="legalForm">
              <option [ngValue]="null">-</option>
              <option value="AG">AG</option>
              <option value="GmbH">GmbH</option>
              <option value="Einzel">Einzel</option>
              <option value="Kollektiv">Kollektiv</option>
              <option value="Kommandit">Kommandit</option>
              <option value="Genossenschaft">Genossenschaft</option>
              <option value="Verein">Verein</option>
              <option value="Stiftung">Stiftung</option>
              <option value="einfache Gesellschaft">einfache Gesellschaft</option>
              <option value="öffentlich rechtliche Anstalt">öffentlich rechtliche Anstalt</option>
            </select>
          </div>

          <!-- Branche -->
          <div class="form-group">
            <label for="industry">Branche</label>
            <input id="industry" type="text" [(ngModel)]="model.industry" name="industry" placeholder="Branche eingeben" />
          </div>

          <!-- Handelsregisternummer UID -->
          <div class="form-group">
            <label for="uidNumber">
              Handelsregisternummer UID
              <a href="https://www.zefix.ch/de/search/entity/welcome" target="_blank" rel="noopener" class="help-link" title="Zefix Handelsregister">(?)</a>
            </label>
            <input id="uidNumber" type="text" [(ngModel)]="model.uidNumber" name="uidNumber" placeholder="CHE-XXX.XXX.XXX" />
          </div>

          <!-- Gründungsdatum -->
          <div class="form-group">
            <label for="foundingDate">Gründungsdatum</label>
            <input id="foundingDate" type="date" [(ngModel)]="model.foundingDate" name="foundingDate" />
          </div>

          <!-- Homepage -->
          <div class="form-group">
            <label for="homepage">Homepage</label>
            <input id="homepage" type="url" [(ngModel)]="model.homepage" name="homepage" placeholder="https://www.beispiel.ch" />
          </div>

          <!-- Art der Tätigkeit -->
          <div class="form-group">
            <label for="activityType">Art der Tätigkeit</label>
            <input id="activityType" type="text" [(ngModel)]="model.activityType" name="activityType" placeholder="Art der Tätigkeit" />
          </div>

          <!-- NOGA Code -->
          <div class="form-group">
            <label for="nogaCode">NOGA Code</label>
            <input id="nogaCode" type="text" [(ngModel)]="model.nogaCode" name="nogaCode" placeholder="NOGA Code" />
          </div>

          <!-- Umsatz -->
          <div class="form-group currency-group">
            <label for="revenue">Umsatz</label>
            <div class="currency-input">
              <input id="revenue" type="number" [(ngModel)]="model.revenue" name="revenue" placeholder="0" />
              <span class="currency-suffix">CHF</span>
            </div>
          </div>

          <!-- VTBG -->
          <div class="form-group currency-group">
            <label for="vtbg">VTBG</label>
            <div class="currency-input">
              <input id="vtbg" type="number" [(ngModel)]="model.vtbg" name="vtbg" placeholder="0" />
              <span class="currency-suffix">CHF</span>
            </div>
          </div>

          <!-- Anzahl Mitarbeiter -->
          <div class="form-group">
            <label for="employeeCount">Anzahl Mitarbeiter</label>
            <select id="employeeCount" [(ngModel)]="model.employeeCount" name="employeeCount">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="1-5 MA">1-5 MA</option>
              <option value="6-10 MA">6-10 MA</option>
              <option value="11-20 MA">11-20 MA</option>
              <option value="21-50 MA">21-50 MA</option>
              <option value="51-100 MA">51-100 MA</option>
              <option value="über 100 MA">über 100 MA</option>
            </select>
          </div>

          <!-- Lohnsumme -->
          <div class="form-group currency-group">
            <label for="totalSalary">Lohnsumme</label>
            <div class="currency-input">
              <input id="totalSalary" type="number" [(ngModel)]="model.totalSalary" name="totalSalary" placeholder="0" />
              <span class="currency-suffix">CHF</span>
            </div>
          </div>

          <!-- Kontakt Section -->
          <div class="section-separator">
            <h3>Ansprechperson</h3>
          </div>

          <!-- Kontakt Anrede -->
          <div class="form-group">
            <label for="contactSalutation">Anrede</label>
            <select id="contactSalutation" [(ngModel)]="model.contactSalutation" name="contactSalutation">
              <option [ngValue]="null">Bitte auswählen</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
            </select>
          </div>

          <!-- Kontakt Vorname -->
          <div class="form-group">
            <label for="contactFirstName">Vorname</label>
            <input id="contactFirstName" type="text" [(ngModel)]="model.contactFirstName" name="contactFirstName" placeholder="Vorname" />
          </div>

          <!-- Kontakt Name -->
          <div class="form-group">
            <label for="contactName">Name</label>
            <input id="contactName" type="text" [(ngModel)]="model.contactName" name="contactName" placeholder="Nachname" />
          </div>

          <!-- Kontakt Telefon -->
          <div class="form-group">
            <label for="contactPhone">Telefon</label>
            <input id="contactPhone" type="tel" [(ngModel)]="model.contactPhone" name="contactPhone" placeholder="+41 XX XXX XX XX" />
          </div>

          <!-- Kontakt E-Mail -->
          <div class="form-group">
            <label for="contactEmail">E-Mail</label>
            <input id="contactEmail" type="email" [(ngModel)]="model.contactEmail" name="contactEmail" placeholder="kontakt@beispiel.ch" />
          </div>
        </ng-container>

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
    .section-separator{margin:1.5rem 0 1rem;padding-top:1rem;border-top:2px solid #e5e7eb}
    .section-separator h3{font-size:1rem;font-weight:600;color:#374151;margin:0}
    
    /* Customer Type Selection */
    .type-selection{margin-bottom:1rem}
    .type-toggle{display:flex;gap:0;border:1px solid #d1d5db;border-radius:8px;overflow:hidden}
    .type-btn{flex:1;padding:.8rem 1rem;background:#f9fafb;border:none;cursor:pointer;font-weight:600;color:#6b7280;transition:all .2s}
    .type-btn:first-child{border-right:1px solid #d1d5db}
    .type-btn.active{background:#3b82f6;color:#fff}
    .type-btn:hover:not(.active){background:#f3f4f6}

    /* Currency input */
    .currency-group .currency-input{display:flex;align-items:center;gap:0}
    .currency-input input{border-radius:8px 0 0 8px;flex:1}
    .currency-suffix{padding:.7rem 1rem;background:#f3f4f6;border:1px solid #d1d5db;border-left:none;border-radius:0 8px 8px 0;color:#6b7280;font-weight:500}

    /* Help link */
    .help-link{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:.75rem;text-decoration:none;margin-left:.3rem;font-weight:700}
    .help-link:hover{background:#d1d5db;color:#374151}
  `]
})
export class CustomerFormComponent implements OnInit {
  @Input() model: any = {
    customerType: 0, // 0 = Privatperson, 1 = Organisation
    firstName: '',
    name: '',
    email: '',
    ahvNum: '',
    advisorId: null as number | null,

    // Privatperson fields
    civilStatus: null as string | null,
    religion: null as string | null,
    gender: null as string | null,
    salutation: null as string | null,
    birthDate: null as string | null,
    profession: '',
    language: null as string | null,
    
    // Address fields
    street: '',
    postalCode: '',
    locality: '',
    canton: null as string | null,
    
    isPrimaryContact: true,

    // Organisation fields
    companyName: '',
    legalForm: null as string | null,
    industry: '',
    uidNumber: '',
    foundingDate: null as string | null,
    homepage: '',
    activityType: '',
    nogaCode: '',
    revenue: null as number | null,
    vtbg: null as number | null,
    employeeCount: null as string | null,
    totalSalary: null as number | null,

    // Organisation contact fields
    contactSalutation: null as string | null,
    contactFirstName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
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
    // Set name from companyName for Organisation type
    if (this.model.customerType === 1 && this.model.companyName && !this.model.name) {
      this.model.name = this.model.companyName;
    }
  }

  setCustomerType(type: number): void {
    this.model.customerType = type;
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
    
    // For Organisation, set name from companyName if not set
    if (this.model.customerType === 1 && this.model.companyName) {
      this.model.name = this.model.companyName;
    }
    
    this.submit.emit();
  }

  formatAhvNumber(): void {
    if (!this.model.ahvNum) return;
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
