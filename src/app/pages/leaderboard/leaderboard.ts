import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

/**
 * Leaderboard Page Component
 * Protected page (login required)
 * Shows global rankings of top users by XP
 * Highlights current user's rank
 */
@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, Sidebar],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  userId = 0; // Current user's ID (used to highlight in rankings)
  leaderboard: any[] = []; // Top 10 users ranked by XP
  readonly avatarBase = '/assets/'; // Base path for user avatar images

  constructor(private auth: Auth, private api: Api) {}

  /**
   * Load page
   * 1. Get current user ID from localStorage
   * 2. Show cached leaderboard immediately (instant load)
   * 3. Fetch fresh rankings from backend
   */
  ngOnInit() {
    const user = this.auth.getUser();
    if (user) this.userId = Number(user.id);

    // Show cached data immediately
    const cached = this.auth.getCache('leaderboard');
    if (cached) this.leaderboard = cached;

    // Fetch fresh rankings from backend
    this.api.getLeaderboard().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leaderboard = res.leaderboard || [];
          this.auth.setCache('leaderboard', this.leaderboard);
        }
      },
      error: () => {}
    });
  }
}
