import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  readonly avatarBase = 'http://localhost/codehub-api/';

  constructor(private auth: Auth, private router: Router) {}

  get user() { return this.auth.getUser(); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
