import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {

  displayName = '';
  isIncomplete = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.api.get('/api/user/me').subscribe({
      next: (res: any) => {
        const first = res.firstName?.trim() || '';
        const last = res.name?.trim() || '';

        if (!first || !last) {
          this.isIncomplete = true;
          this.displayName = 'Profil unvollständig';
        } else {
          this.isIncomplete = false;
          this.displayName = `${first} ${last}`;
        }
      },
      error: () => {
        this.displayName = '';
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/settings/profile']);
  }

  logout(): void {
    this.auth.logout();
  }
}
