import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Input() forcePublic = false;
  avatarError = false;

  constructor(public auth: Auth, private router: Router) {}

  ngOnInit() {
    this.avatarError = false;
  }

  get user() { return this.auth.getUser(); }

  onAvatarError() { this.avatarError = true; }

  logout() {
    this.auth.logout();
  }

  get hearts() { return this.auth.getHearts(); }
  get heartsArray() { return Array(5).fill(0).map((_, i) => i < this.hearts); }
}
