// src/app/shared/components/topbar/topbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  userEmail = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.email || '';
    } catch {
      this.userEmail = '';
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
