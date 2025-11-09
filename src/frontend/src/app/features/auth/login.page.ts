// src/app/features/auth/login.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.loading = true;
    this.error = '';

    const success = await this.auth.login(this.email, this.password);
    this.loading = false;

    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Login fehlgeschlagen. Bitte Zugangsdaten prüfen.';
    }
  }
}
