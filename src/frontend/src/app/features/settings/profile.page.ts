import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {

  user = {
    email: '',
    firstName: '',
    name: '',
    tenantName: ''
  };

  phoneUI = '';           // Was im Input steht
  isFullNumber = false;   // true, wenn User mit "+" beginnt

  loading = false;
  saving = false;
  error = '';

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.api.get('/api/user/me').subscribe({
      next: (res: any) => {
        this.user = {
          email: res.email ?? '',
          firstName: res.firstName ?? '',
          name: res.name ?? '',
          tenantName: res.tenantName || localStorage.getItem('tenant_name') || ''
        };

        this.initPhone(res.phone ?? null);

        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Benutzerdaten.';
        this.loading = false;
      }
    });
  }

  private initPhone(phone: string | null) {
    if (!phone) {
      this.phoneUI = '';
      this.isFullNumber = false;
      return;
    }

    const trimmed = phone.trim();

    if (trimmed.startsWith('+41')) {
      this.isFullNumber = false;
      this.phoneUI = trimmed.replace('+41', '').trim();
    } else if (trimmed.startsWith('+')) {
      this.isFullNumber = true;
      this.phoneUI = trimmed;
    } else {
      this.isFullNumber = false;
      this.phoneUI = trimmed;
    }
  }

  onPhoneChange(value: string) {
    if (value.startsWith('+')) {
      this.isFullNumber = true;
      this.phoneUI = value.replace(/[^+\d ]/g, '');
      return;
    }

    this.isFullNumber = false;
    this.phoneUI = value.replace(/[^\d ]/g, '');
  }

  restrictPhone(event: KeyboardEvent) {
    const ctrl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (ctrl.includes(event.key) || event.key === ' ') return;

    if (event.key === '+') {
      this.isFullNumber = true;
      return;
    }

    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  private buildBackendPhone(): string | null {
    const cleaned = this.phoneUI.trim();
    if (!cleaned) return null;

    if (this.isFullNumber) return cleaned;

    return '+41 ' + cleaned;
  }

  save(): void {
    if (this.saving) return;

    this.saving = true;

    const payload = {
      firstName: this.user.firstName,
      name: this.user.name,
      phone: this.buildBackendPhone()
    };

    this.api.put('/api/user/me', payload).subscribe({
      next: () => {
        this.toast.show('Profil aktualisiert', 'success');
        this.saving = false;
      },
      error: () => {
        this.toast.show('Fehler beim Speichern', 'error');
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
