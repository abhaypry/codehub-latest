import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

/**
 * Navbar Component (Shared)
 * Sticky top navigation bar on all pages
 * Shows:
 * - CodeHub logo
 * - Nav links (home, courses, leaderboard, profile)
 * - User avatar + logout
 * - Hearts ❤️ / XP ⚡ / Streak 🔥 (when logged in)
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Input() forcePublic = false; // Force public navigation (hide user info) even if logged in
  avatarError = false; // Avatar image failed to load → show fallback

  constructor(public auth: Auth, private router: Router) {}

  ngOnInit() {
    this.avatarError = false;
  }

  // Get logged-in user from localStorage
  get user() { return this.auth.getUser(); }

  // Avatar image failed to load
  onAvatarError() { this.avatarError = true; }

  // Log out user and redirect to home
  logout() {
    this.auth.logout();
  }

  // Get current hearts count
  get hearts() { return this.auth.getHearts(); }
  // Array for hearts display: [true, true, false, false, false] for 2 hearts
  get heartsArray() { return Array(5).fill(0).map((_, i) => i < this.hearts); }
}
