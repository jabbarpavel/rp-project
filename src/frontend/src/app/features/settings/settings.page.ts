import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <h2>Einstellungen</h2>

      <div class="grid">
        <a class="card" [routerLink]="['/settings/profile']">
          <h3>Mein Profil</h3>
          <p>Vorname, Nachname und Telefon verwalten.</p>
        </a>

        <!-- Platzhalter für künftige Bereiche -->
        <div class="card disabled">
          <h3>Mandanten-Einstellungen</h3>
          <p>Demnächst verfügbar.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }
    h2 { font-size: 1.6rem; margin: 0 0 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 1rem; }
    .card {
      display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 1rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,.04);
      transition: transform .08s ease, box-shadow .12s ease;
    }
    .card:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.06); }
    .card h3 { margin: 0 0 .25rem; font-size: 1.1rem; }
    .card p { margin: 0; color: #6b7280; font-size: .95rem; }
    .card.disabled { opacity: .5; pointer-events: none; }
  `]
})
export class SettingsOverviewPage {}
