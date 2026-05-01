import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

/**
 * Sidebar Component (Shared)
 * Left sidebar navigation on logged-in pages (dashboard, courses, profile)
 * Shows:
 * - User avatar + name
 * - Navigation links (dashboard, courses, leaderboard, profile)
 * - Logout button
 * - Theme colors (changes based on selected course)
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, AfterViewInit {
  readonly avatarBase = '/assets/'; // Base path for avatar images
  avatarError = false; // Avatar image failed to load → show fallback

  constructor(private auth: Auth, private router: Router) {}

  /**
   * Restore theme colors on page load
   * Applies saved course colors (from previous session) to CSS variables
   */
  ngOnInit() {
    const color = localStorage.getItem('codehub_theme_color');
    const dark  = localStorage.getItem('codehub_theme_color_dark');
    if (color) document.body.style.setProperty('--course-color', color);
    if (dark)  document.body.style.setProperty('--course-color-dark', dark);
  }

  // Notify page that navbar is ready (for animations/styling)
  ngAfterViewInit() {
    requestAnimationFrame(() => {
      document.body.classList.add('nav-ready');
    });
  }

  // Get logged-in user from localStorage
  get user() { return this.auth.getUser(); }

  // Avatar image failed to load
  onAvatarError() { this.avatarError = true; }

  // Log out user and redirect to login
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
