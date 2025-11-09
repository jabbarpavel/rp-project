// src/app/features/settings/settings.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Einstellungen</h2>
      <p>Hier können später tenant- oder userbezogene Einstellungen geladen werden.</p>
    </div>
  `,
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {}
